"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeSellerOrderPickup,
  refreshSellerOrderRefund,
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
    onSuccess: (detail) => {
      queryClient.setQueryData(orderKeys.detail(orderId), detail);
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useRefreshSellerOrderRefundMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshSellerOrderRefund(orderId),
    onSuccess: (detail) => {
      queryClient.setQueryData(orderKeys.detail(orderId), detail);
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
