"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSellerInquiries,
  getSellerInquiry,
} from "@/features/inquiries/api/inquiries-api";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type { SellerInquiryListParams } from "@/features/inquiries/model/inquiry-types";

export function useSellerInquiriesQuery(
  params: SellerInquiryListParams = {},
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getSellerInquiries(params),
    queryKey: inquiryKeys.list(params),
  });
}

export function useSellerInquiryQuery(inquiryId: string) {
  return useQuery({
    queryFn: () => getSellerInquiry(inquiryId),
    queryKey: inquiryKeys.detail(inquiryId),
  });
}
