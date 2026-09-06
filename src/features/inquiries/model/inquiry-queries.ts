"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSellerInquiries,
  getSellerInquiry,
} from "@/features/inquiries/api/inquiries-api";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";

export function useSellerInquiriesQuery() {
  return useQuery({
    queryFn: getSellerInquiries,
    queryKey: inquiryKeys.list(),
  });
}

export function useSellerInquiryQuery(inquiryId: string) {
  return useQuery({
    queryFn: () => getSellerInquiry(inquiryId),
    queryKey: inquiryKeys.detail(inquiryId),
  });
}
