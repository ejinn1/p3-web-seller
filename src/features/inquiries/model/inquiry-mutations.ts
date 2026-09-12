"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  markSellerInquiryRead,
  markSellerOrderFormSubmissionViewed,
  moveSellerInquiryToTrash,
  requestSellerOrderFormRevision,
  replaceSellerOrderConfirmation,
  sendSellerOrderConfirmation,
} from "@/features/inquiries/api/inquiries-api";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type {
  InquiryListItem,
  SellerInquiryListParams,
  SendSellerOrderConfirmationRequest,
} from "@/features/inquiries/model/inquiry-types";

export function useSendSellerOrderConfirmationMutation(inquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendSellerOrderConfirmationRequest) =>
      sendSellerOrderConfirmation({ inquiryId, request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inquiryKeys.detail(inquiryId),
      });
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

export function useReplaceSellerOrderConfirmationMutation(inquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      confirmationId,
      replacementConfirmationId,
    }: {
      confirmationId: string;
      replacementConfirmationId: string;
    }) =>
      replaceSellerOrderConfirmation(
        inquiryId,
        confirmationId,
        replacementConfirmationId,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inquiryKeys.detail(inquiryId),
      });
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

export function useMarkSellerInquiryReadMutation(inquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markSellerInquiryRead(inquiryId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        predicate: (query) => isSellerInquiryListKey(query.queryKey),
      });
      queryClient
        .getQueryCache()
        .findAll({
          predicate: (query) => isSellerInquiryListKey(query.queryKey),
        })
        .forEach((query) => {
          const params = getSellerInquiryListParams(query.queryKey);

          queryClient.setQueryData<InquiryListItem[]>(
            query.queryKey,
            (current) =>
              current
                ?.map((item) =>
                  item.id === inquiryId ? { ...item, unreadCount: 0 } : item,
                )
                .filter((item) => matchesSellerInquiryListParams(item, params)),
          );
        });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => isSellerInquiryListKey(query.queryKey),
      });
      void queryClient.invalidateQueries({
        queryKey: inquiryKeys.detail(inquiryId),
      });
    },
  });
}

export function useMarkSellerOrderFormSubmissionViewedMutation(
  inquiryId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) =>
      markSellerOrderFormSubmissionViewed(inquiryId, submissionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inquiryKeys.detail(inquiryId),
      });
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

function isSellerInquiryListKey(queryKey: QueryKey) {
  return (
    Array.isArray(queryKey) &&
    queryKey[0] === "seller" &&
    queryKey[1] === "inquiries" &&
    queryKey[2] === "list"
  );
}

function getSellerInquiryListParams(
  queryKey: QueryKey,
): SellerInquiryListParams {
  const params = Array.isArray(queryKey) ? queryKey[3] : undefined;

  return isSellerInquiryListParams(params) ? params : {};
}

function isSellerInquiryListParams(
  value: unknown,
): value is SellerInquiryListParams {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function matchesSellerInquiryListParams(
  item: InquiryListItem,
  params: SellerInquiryListParams,
) {
  if (params.status && item.status !== params.status) {
    return false;
  }

  if (params.unreadOnly && item.unreadCount <= 0) {
    return false;
  }

  return true;
}

export function useRequestSellerOrderFormRevisionMutation(inquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) =>
      requestSellerOrderFormRevision(inquiryId, submissionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inquiryKeys.detail(inquiryId),
      });
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

export function useMoveSellerInquiryToTrashMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveSellerInquiryToTrash,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}
