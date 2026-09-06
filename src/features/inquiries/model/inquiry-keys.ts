import type { SellerInquiryListParams } from "@/features/inquiries/model/inquiry-types";

export const inquiryKeys = {
  all: ["seller", "inquiries"] as const,
  detail: (inquiryId: string) =>
    [...inquiryKeys.all, inquiryId, "detail"] as const,
  list: (params: SellerInquiryListParams = {}) =>
    [...inquiryKeys.all, "list", params] as const,
};
