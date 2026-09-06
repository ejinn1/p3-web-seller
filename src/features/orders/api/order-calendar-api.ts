import { getJson } from "@/lib/api/client";
import {
  orderCalendarFixture,
  sellerOrderDetailFixture,
} from "@/features/orders/model/order-calendar-fixtures";
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

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export async function getSellerOrderCalendarMonth({
  month,
  status,
  year,
}: CalendarMonthParams) {
  if (useFixtures) {
    return orderCalendarFixture;
  }

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

export async function getSellerOrderDetail(orderId: string | null) {
  if (!orderId || useFixtures) {
    return sellerOrderDetailFixture;
  }

  return getJson<SellerOrderDetailResponse>(`/seller/orders/${orderId}`);
}
