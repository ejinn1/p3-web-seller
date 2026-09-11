import type { SellerInquiryListParams } from "@/features/inquiries/model/inquiry-types";

export const inquiryKeys = {
  all: ["seller", "inquiries"] as const,
  confirmationPreview: (inquiryId: string, submissionId: string) =>
    [
      ...inquiryKeys.all,
      inquiryId,
      "confirmation-preview",
      submissionId,
    ] as const,
  detail: (inquiryId: string) =>
    [...inquiryKeys.all, inquiryId, "detail"] as const,
  list: (params: SellerInquiryListParams = {}) =>
    [...inquiryKeys.all, "list", params] as const,
  timeline: (inquiryId: string) =>
    [...inquiryKeys.all, inquiryId, "timeline"] as const,
};
