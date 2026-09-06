"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeSellerOrderPickup,
  refundSellerOrder,
} from "@/features/orders/api/orders-api";
import { orderKeys } from "@/features/orders/model/order-keys";

export function useCompleteSellerOrderPickupMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeSellerOrderPickup(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}

export function useRefundSellerOrderMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => refundSellerOrder({ orderId, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
