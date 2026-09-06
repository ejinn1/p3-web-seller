import { useQuery } from "@tanstack/react-query";
import {
  getSellerOrder,
  getSellerOrders,
} from "@/features/orders/api/orders-api";
import { orderKeys } from "@/features/orders/model/order-keys";

export function useSellerOrdersQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getSellerOrders,
    queryKey: orderKeys.list(),
  });
}

export function useSellerOrderQuery(orderId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getSellerOrder(orderId),
    queryKey: orderKeys.detail(orderId),
  });
}
