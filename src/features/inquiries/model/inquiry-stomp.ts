"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { appendTimelineItem } from "@/features/inquiries/model/inquiry-adapters";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type {
  InquiryDetail,
  InquiryTimelineItemResponse,
} from "@/features/inquiries/model/inquiry-types";
import {
  connectStomp,
  type StompConnection,
} from "@/lib/stomp/client";

export function useSellerInquiryStomp(inquiryId: string, enabled = true) {
  const queryClient = useQueryClient();
  const connectionRef = useRef<StompConnection | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !process.env.NEXT_PUBLIC_P3_API_BASE_URL) {
      return;
    }

    let mounted = true;

    connectStomp<InquiryTimelineItemResponse>({
      onConnect: () => {
        if (mounted) {
          setIsConnected(true);
        }
      },
      onDisconnect: () => {
        if (mounted) {
          setIsConnected(false);
        }
      },
      onError: (nextError) => {
        if (mounted) {
          setError(nextError);
        }
      },
      subscriptions: [
        {
          destination: `/topic/inquiries/${inquiryId}`,
          onMessage: (message) => {
            queryClient.setQueryData<InquiryDetail>(
              inquiryKeys.detail(inquiryId),
              (current) =>
                current ? appendTimelineItem(current, message) : current,
            );
          },
        },
      ],
    })
      .then((connection) => {
        if (!mounted) {
          connection.disconnect();
          return;
        }

        connectionRef.current = connection;
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(toError(nextError));
        }
      });

    return () => {
      mounted = false;
      connectionRef.current?.disconnect();
      connectionRef.current = null;
    };
  }, [enabled, inquiryId, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      const connection = connectionRef.current;

      if (!connection) {
        if (!process.env.NEXT_PUBLIC_P3_API_BASE_URL) {
          queryClient.setQueryData<InquiryDetail>(
            inquiryKeys.detail(inquiryId),
            (current) =>
              current
                ? appendTimelineItem(current, {
                    assetIds: [],
                    content,
                    createdAt: new Date().toISOString(),
                    eventId: crypto.randomUUID(),
                    senderUserId: null,
                    type: "MESSAGE",
                  })
                : current,
          );
        }
        return;
      }

      connection.sendJson(`/app/inquiries/${inquiryId}/messages`, {
        assetIds: [],
        content,
      });
    },
    [inquiryId, queryClient],
  );

  return { error, isConnected, sendMessage };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
