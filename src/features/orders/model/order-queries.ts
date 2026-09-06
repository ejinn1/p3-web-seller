import { useQuery } from "@tanstack/react-query";
import {
  getSellerOrder,
  getSellerOrders,
} from "@/features/orders/api/orders-api";
import { orderKeys } from "@/features/orders/model/order-keys";
import type { SellerOrderListParams } from "@/features/orders/model/order-types";

export function useSellerOrdersQuery(
  params: SellerOrderListParams = {},
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getSellerOrders(params),
    queryKey: orderKeys.list(params),
  });
}

export function useSellerOrderQuery(orderId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getSellerOrder(orderId),
    queryKey: orderKeys.detail(orderId),
  });
}
