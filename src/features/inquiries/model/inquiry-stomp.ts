"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
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
  const receivedEventIdsRef = useRef<Set<string>>(new Set());
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
          setError(null);
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
            if (isDuplicateEvent(message.eventId, receivedEventIdsRef.current)) {
              return;
            }

            queryClient.setQueryData<InquiryDetail>(
              inquiryKeys.detail(inquiryId),
              (current) => appendTimelineItemOnce(current, message),
            );

            void queryClient.invalidateQueries({
              predicate: (query) => isSellerInquiryListKey(query.queryKey),
            });

            if (isCtaTimelineItem(message)) {
              void queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(inquiryId) });
            }

            if (message.type === "PAYMENT_COMPLETED") {
              void queryClient.invalidateQueries({ queryKey: orderKeys.all });
              void queryClient.invalidateQueries({ queryKey: orderCalendarKeys.all });
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

function appendTimelineItemOnce(
  current: InquiryDetail | undefined,
  item: InquiryTimelineItemResponse,
) {
  if (!current || current.messages.some((message) => message.id === item.eventId)) {
    return current;
  }

  return appendTimelineItem(current, item);
}

function isCtaTimelineItem(item: InquiryTimelineItemResponse) {
  return (
    item.type === "ORDER_FORM_SUBMISSION" ||
    item.type === "ORDER_FORM_REVISION_REQUEST" ||
    item.type === "ORDER_CONFIRMATION" ||
    item.type === "ORDER_CONFIRMATION_REVISION" ||
    item.type === "PAYMENT_COMPLETED"
  );
}

function isDuplicateEvent(eventId: string, receivedEventIds: Set<string>) {
  if (receivedEventIds.has(eventId)) return true;

  receivedEventIds.add(eventId);
  if (receivedEventIds.size > 100) {
    const oldestEventId = receivedEventIds.values().next().value;
    if (oldestEventId) receivedEventIds.delete(oldestEventId);
  }
  return false;
}

function isSellerInquiryListKey(queryKey: QueryKey) {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === "seller" &&
    queryKey[1] === "inquiries" &&
    queryKey[2] === "list"
  );
}
