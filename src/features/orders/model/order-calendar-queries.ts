"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSellerOrderCalendarMonth,
  getSellerOrderDetail,
} from "@/features/orders/api/order-calendar-api";
import { orderCalendarKeys } from "@/features/orders/model/order-calendar-keys";
import type { OrderStatus } from "@/features/orders/model/order-calendar-types";

export function useSellerOrderCalendarMonthQuery({
  month,
  status,
  year,
}: {
  month: number;
  status?: OrderStatus;
  year: number;
}) {
  return useQuery({
    queryFn: () => getSellerOrderCalendarMonth({ month, status, year }),
    queryKey: orderCalendarKeys.month(year, month, status),
  });
}

export function useSellerOrderDetailQuery(orderId: string | null) {
  return useQuery({
    enabled: Boolean(orderId),
    queryFn: () => getSellerOrderDetail(orderId),
    queryKey: orderCalendarKeys.detail(orderId),
  });
}
