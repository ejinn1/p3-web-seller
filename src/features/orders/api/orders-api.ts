import { getJson } from "@/lib/api/client";
import {
  findSellerOrderFixture,
  sellerOrderListFixture,
} from "@/features/orders/model/order-fixtures";
import type {
  SellerOrderDetail,
  SellerOrderListItem,
} from "@/features/orders/model/order-types";

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export const getSellerOrders = () => {
  if (useFixtures) {
    return Promise.resolve(sellerOrderListFixture);
  }

  return getJson<SellerOrderListItem[]>("/seller/orders");
};

export const getSellerOrder = (orderId: string) => {
  if (useFixtures) {
    return Promise.resolve(findSellerOrderFixture(orderId).detail);
  }

  return getJson<SellerOrderDetail>(`/seller/orders/${orderId}`);
};
