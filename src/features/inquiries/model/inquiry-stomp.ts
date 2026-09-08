"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { appendTimelineItem } from "@/features/inquiries/model/inquiry-adapters";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type {
  InquiryDetail,
  InquiryTimelineItemResponse,
} from "@/features/inquiries/model/inquiry-types";
import { connectStomp, type StompConnection } from "@/lib/stomp/client";
import { orderCalendarKeys } from "@/features/orders/model/order-calendar-keys";
import { orderKeys } from "@/features/orders/model/order-keys";

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

            void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });

            if (message.type === "PAYMENT_COMPLETED") {
              void queryClient.invalidateQueries({ queryKey: orderKeys.all });
              void queryClient.invalidateQueries({
                queryKey: orderCalendarKeys.all,
              });
            }
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
        setError(new Error("채팅 서버에 연결되어 있지 않습니다."));
        return;
      }

      connection.sendJson(`/app/inquiries/${inquiryId}/messages`, {
        assetIds: [],
        content,
      });
    },
    [inquiryId],
  );

  return { error, isConnected, sendMessage };
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
