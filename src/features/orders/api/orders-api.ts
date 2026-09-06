import { getJson, sendJson } from "@/lib/api/client";
import {
  findSellerOrderFixture,
  sellerOrderListFixture,
} from "@/features/orders/model/order-fixtures";
import type {
  SellerOrderDetail,
  SellerOrderListItem,
  SellerOrderListParams,
  SellerOrder,
} from "@/features/orders/model/order-types";

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export const getSellerOrders = (params: SellerOrderListParams = {}) => {
  if (useFixtures) {
    return Promise.resolve(filterFixtureOrders(params));
  }

  const searchParams = new URLSearchParams();
  const statuses = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];

  if (statuses.length) {
    searchParams.set("status", statuses.join(","));
  }

  if (params.startDate) {
    searchParams.set("startDate", params.startDate);
  }

  if (params.endDate) {
    searchParams.set("endDate", params.endDate);
  }

  if (params.dateBasis) {
    searchParams.set("dateBasis", params.dateBasis);
  }

  const query = searchParams.toString();
  return getJson<SellerOrderListItem[]>(`/seller/orders${query ? `?${query}` : ""}`);
};

export const getSellerOrder = (orderId: string) => {
  if (useFixtures) {
    return Promise.resolve(findSellerOrderFixture(orderId).detail);
  }

  return getJson<SellerOrderDetail>(`/seller/orders/${orderId}`);
};

export const completeSellerOrderPickup = (orderId: string) =>
  sendJson<SellerOrder>(`/seller/orders/${orderId}/pickup`, "PATCH");

export const refundSellerOrder = ({
  orderId,
  reason,
}: {
  orderId: string;
  reason?: string;
}) =>
  sendJson<SellerOrderDetail>(
    `/seller/orders/${orderId}/refund`,
    "POST",
    reason?.trim() ? { reason: reason.trim() } : undefined,
  );

function filterFixtureOrders(params: SellerOrderListParams) {
  return sellerOrderListFixture.filter((order) => {
    const statuses = Array.isArray(params.status)
      ? params.status
      : params.status
        ? [params.status]
        : [];
    if (statuses.length && (!order.status || !statuses.includes(order.status))) {
      return false;
    }

    if (!params.startDate && !params.endDate) {
      return true;
    }

    const basisValue =
      params.dateBasis === "PICKUP_AT" ? order.pickupAt : order.createdAt;
    const basisDate = basisValue.slice(0, 10);

    if (params.startDate && basisDate < params.startDate) {
      return false;
    }

    return !(params.endDate && basisDate > params.endDate);
  });
}
