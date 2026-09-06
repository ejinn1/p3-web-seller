import type { SellerOrderListParams } from "@/features/orders/model/order-types";

export const orderKeys = {
  all: ["seller-orders"] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  list: (params: SellerOrderListParams = {}) =>
    [...orderKeys.all, "list", params] as const,
};
