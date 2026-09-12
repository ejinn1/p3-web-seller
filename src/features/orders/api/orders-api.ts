import { getJson, sendJson } from "@/lib/api/client";
import type {
  SellerOrderDetail,
  SellerOrderListItem,
  SellerOrderListParams,
  SellerOrder,
} from "@/features/orders/model/order-types";

export const getSellerOrders = (params: SellerOrderListParams = {}) => {
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
  return getJson<SellerOrderListItem[]>(
    `/seller/orders${query ? `?${query}` : ""}`,
  );
};

export const getSellerOrder = (orderId: string) => {
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

export const refreshSellerOrderRefund = (orderId: string) =>
  sendJson<SellerOrderDetail>(
    `/seller/orders/${orderId}/refund/refresh`,
    "POST",
  );

export const completeSellerOrderManualRefund = ({
  orderId,
  refundId,
}: {
  orderId: string;
  refundId: string;
}) =>
  sendJson<SellerOrderDetail>(
    `/seller/orders/${orderId}/refunds/${refundId}/manual-complete`,
    "POST",
  );
