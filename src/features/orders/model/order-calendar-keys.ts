import type { OrderStatus } from "@/features/orders/model/order-calendar-types";

export const orderCalendarKeys = {
  all: ["orders", "calendar"] as const,
  detail: (orderId: string | null) =>
    [...orderCalendarKeys.all, "detail", orderId] as const,
  month: (year: number, month: number, status?: OrderStatus) =>
    [...orderCalendarKeys.all, "month", year, month, status ?? "ALL"] as const,
};
