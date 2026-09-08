"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSellerOrderConfirmation } from "@/features/inquiries/api/inquiries-api";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type { SendSellerOrderConfirmationRequest } from "@/features/inquiries/model/inquiry-types";

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
