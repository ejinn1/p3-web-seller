import { useQuery } from "@tanstack/react-query";
import {
  getSellerInquiryChatDetail,
  getSellerOrderConfirmation,
  getSellerOrderFormSubmission,
} from "@/features/inquiries/api/inquiries-api";
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

export function useSellerOrderConfirmationQuery(
  inquiryId: string | null,
  confirmationId: string | null,
) {
  return useQuery({
    enabled: Boolean(inquiryId && confirmationId),
    queryFn: () => getSellerOrderConfirmation(inquiryId!, confirmationId!),
    queryKey: orderKeys.confirmation(inquiryId ?? "", confirmationId ?? ""),
  });
}

export function useSellerOrderInquiryQuery(inquiryId: string | null) {
  return useQuery({
    enabled: Boolean(inquiryId),
    queryFn: () => getSellerInquiryChatDetail(inquiryId!),
    queryKey: orderKeys.inquiry(inquiryId ?? ""),
  });
}

export function useSellerOrderSubmissionQuery(
  inquiryId: string | null,
  submissionId: string | null,
) {
  return useQuery({
    enabled: Boolean(inquiryId && submissionId),
    queryFn: () => getSellerOrderFormSubmission(inquiryId!, submissionId!),
    queryKey: orderKeys.submission(inquiryId ?? "", submissionId ?? ""),
  });
}
