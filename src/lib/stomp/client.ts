import { getAccessToken } from "@/lib/api/client";

type StompSubscription<T> = {
  destination: string;
  onMessage: (message: T) => void;
};

type ConnectStompOptions<T> = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  subscriptions: StompSubscription<T>[];
};

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 10_000;

type StompFrame = {
  body: string;
  command: string;
  headers: Record<string, string>;
};

export type StompConnection = {
  disconnect: () => void;
  sendJson: (destination: string, body: unknown) => void;
};

export async function connectStomp<T>({
  onConnect,
  onDisconnect,
  onError,
  subscriptions,
}: ConnectStompOptions<T>): Promise<StompConnection> {
  let socket: WebSocket | null = null;
  let connected = false;
  let disconnectRequested = false;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleReconnect = () => {
    if (disconnectRequested || reconnectTimer) {
      return;
    }

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
      MAX_RECONNECT_DELAY_MS,
    );
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void openSocket();
    }, delay);
  };

  const openSocket = async () => {
    try {
      const token = await getAccessToken();
      if (disconnectRequested) {
        return;
      }

      const nextSocket = new WebSocket(toStompUrl());
      socket = nextSocket;

      nextSocket.addEventListener("open", () => {
        nextSocket.send(
          writeFrame("CONNECT", {
            "accept-version": "1.2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "heart-beat": "10000,10000",
          }),
        );
      });

      nextSocket.addEventListener("message", (event) => {
        const frames = parseFrames(String(event.data));

        for (const frame of frames) {
          if (frame.command === "CONNECTED") {
            connected = true;
            reconnectAttempt = 0;
            subscriptions.forEach((subscription, index) => {
              nextSocket.send(
                writeFrame("SUBSCRIBE", {
                  destination: subscription.destination,
                  id: `sub-${index}`,
                }),
              );
            });
            onConnect?.();
            continue;
          }

          if (frame.command === "MESSAGE") {
            const subscription = subscriptions.find(
              (item) => item.destination === frame.headers.destination,
            );

            if (!subscription) {
              continue;
            }

            try {
              subscription.onMessage(JSON.parse(frame.body) as T);
            } catch (error) {
              onError?.(toError(error));
            }
          }

          if (frame.command === "ERROR") {
            connected = false;
            onError?.(new Error(frame.body || "STOMP connection failed."));
            nextSocket.close();
          }
        }
      });

      nextSocket.addEventListener("error", () => {
        connected = false;
        onError?.(new Error("STOMP socket error."));
        nextSocket.close();
      });

      nextSocket.addEventListener("close", () => {
        if (socket !== nextSocket) {
          return;
        }

        socket = null;
        connected = false;
        onDisconnect?.();
        scheduleReconnect();
      });
    } catch (error) {
      if (disconnectRequested) {
        return;
      }

      onError?.(toError(error));
      scheduleReconnect();
    }
  };

  await openSocket();

  return {
    disconnect: () => {
      disconnectRequested = true;
      connected = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      const currentSocket = socket;
      socket = null;
      if (currentSocket?.readyState === WebSocket.OPEN) {
        currentSocket.send(writeFrame("DISCONNECT", {}));
      }
      currentSocket?.close();
    },
    sendJson: (destination, body) => {
      if (socket?.readyState !== WebSocket.OPEN || !connected) {
        throw new Error("STOMP socket is not connected.");
      }

      socket.send(
        writeFrame(
          "SEND",
          {
            "content-type": "application/json",
            destination,
          },
          JSON.stringify(body),
        ),
      );
    },
  };
}

function toStompUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_P3_WS_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_P3_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_P3_API_BASE_URL is not configured.");
  }

  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function writeFrame(
  command: string,
  headers: Record<string, string>,
  body = "",
) {
  const headerLines = Object.entries(headers).map(
    ([key, value]) => `${key}:${value}`,
  );
  return `${[command, ...headerLines].join("\n")}\n\n${body}\0`;
}

function parseFrames(payload: string): StompFrame[] {
  return payload
    .split("\0")
    .map((frame) => frame.trim())
    .filter(Boolean)
    .map(parseFrame);
}

function parseFrame(payload: string): StompFrame {
  const [head = "", ...bodyLines] = payload.split("\n\n");
  const [command = "", ...headerLines] = head.split("\n");
  const headers = Object.fromEntries(
    headerLines.map((line) => {
      const separatorIndex = line.indexOf(":");
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    }),
  );

  return { body: bodyLines.join("\n\n"), command, headers };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
