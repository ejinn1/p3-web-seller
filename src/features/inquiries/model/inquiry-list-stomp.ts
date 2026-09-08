"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toInquiryStatusLabel } from "@/features/inquiries/model/inquiry-adapters";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type {
  InquiryDetail,
  InquiryListItem,
  InquiryListRealtimePayload,
} from "@/features/inquiries/model/inquiry-types";
import { connectStomp, type StompConnection } from "@/lib/stomp/client";

export function useSellerInquiryListStomp(userId?: string, enabled = true) {
  const queryClient = useQueryClient();
  const connectionRef = useRef<StompConnection | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !userId || !process.env.NEXT_PUBLIC_P3_API_BASE_URL) {
      return undefined;
    }

    let mounted = true;

    connectStomp<InquiryListRealtimePayload>({
      onError: (nextError) => {
        if (mounted) {
          setError(nextError);
        }
      },
      subscriptions: [
        {
          destination: `/topic/users/${userId}/inquiries`,
          onMessage: (message) => {
            if (message.type !== "INQUIRY_UPDATED") return;

            queryClient.setQueriesData<InquiryListItem[]>(
              { predicate: (query) => isSellerInquiryListKey(query.queryKey) },
              (current) =>
                current?.map((item) =>
                  item.id === message.inquiryId
                    ? {
                        ...item,
                        status: message.status,
                        unreadCount: message.unreadCount,
                      }
                    : item,
                ),
            );
            queryClient.setQueryData<InquiryDetail>(
              inquiryKeys.detail(message.inquiryId),
              (current) =>
                current
                  ? {
                      ...current,
                      status: message.status,
                      statusLabel: toInquiryStatusLabel(message.status),
                    }
                  : current,
            );
            void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
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
          setError(
            nextError instanceof Error
              ? nextError
              : new Error(String(nextError)),
          );
        }
      });

    return () => {
      mounted = false;
      connectionRef.current?.disconnect();
      connectionRef.current = null;
    };
  }, [enabled, queryClient, userId]);

  return { error };
}

function isSellerInquiryListKey(queryKey: QueryKey) {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === "seller" &&
    queryKey[1] === "inquiries" &&
    queryKey[2] === "list"
  );
}
