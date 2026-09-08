import { getJson } from "@/lib/api/client";
import type {
  OrderCalendarResponse,
  OrderStatus,
  SellerOrderDetailResponse,
} from "@/features/orders/model/order-calendar-types";

type CalendarMonthParams = {
  month: number;
  status?: OrderStatus;
  year: number;
};

export async function getSellerOrderCalendarMonth({
  month,
  status,
  year,
}: CalendarMonthParams) {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  if (status) {
    params.set("status", status);
  }

  return getJson<OrderCalendarResponse>(
    `/seller/orders/calendar/month?${params.toString()}`,
  );
}

export async function getSellerOrderDetail(orderId: string) {
  return getJson<SellerOrderDetailResponse>(`/seller/orders/${orderId}`);
}
