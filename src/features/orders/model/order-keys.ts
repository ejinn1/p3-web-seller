import type { SellerOrderListParams } from "@/features/orders/model/order-types";

export const orderKeys = {
  all: ["seller-orders"] as const,
  confirmation: (inquiryId: string, confirmationId: string) =>
    [...orderKeys.all, "confirmation", inquiryId, confirmationId] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  inquiry: (inquiryId: string) =>
    [...orderKeys.all, "inquiry", inquiryId] as const,
  list: (params: SellerOrderListParams = {}) =>
    [...orderKeys.all, "list", params] as const,
  submission: (inquiryId: string, submissionId: string) =>
    [...orderKeys.all, "submission", inquiryId, submissionId] as const,
};
