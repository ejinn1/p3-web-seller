import {
  inquiryDetailFixture,
  inquiryListFixture,
} from "@/features/inquiries/model/inquiry-fixtures";
import type {
  InquiryDetail,
  InquiryListItem,
} from "@/features/inquiries/model/inquiry-types";

export async function getSellerInquiries(): Promise<InquiryListItem[]> {
  return inquiryListFixture;
}

export async function getSellerInquiry(
  inquiryId: string,
): Promise<InquiryDetail> {
  return { ...inquiryDetailFixture, id: inquiryId };
}
