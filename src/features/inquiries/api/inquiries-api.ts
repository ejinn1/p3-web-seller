import { getJson, sendJson } from "@/lib/api/client";
import {
  inquiryDetailFixture,
  inquiryListFixture,
} from "@/features/inquiries/model/inquiry-fixtures";
import {
  toInquiryDetail,
  toInquiryListItem,
} from "@/features/inquiries/model/inquiry-adapters";
import type {
  InquiryChatDetailResponse,
  InquiryDetail,
  InquiryListApiItem,
  InquiryListItem,
  InquiryOrderConfirmationResponse,
  InquiryOrderFormSubmissionResponse,
  InquiryTimelinePageResponse,
  SellerInquiryListParams,
  SendSellerOrderConfirmationRequest,
} from "@/features/inquiries/model/inquiry-types";

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export async function getSellerInquiries(
  params: SellerInquiryListParams = {},
): Promise<InquiryListItem[]> {
  if (useFixtures) {
    return inquiryListFixture.filter((item) => {
      if (params.status && item.status !== params.status) {
        return false;
      }

      return !(params.unreadOnly && item.unreadCount <= 0);
    });
  }

  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.unreadOnly) {
    searchParams.set("unreadOnly", "true");
  }

  const query = searchParams.toString();
  const items = await getJson<InquiryListApiItem[]>(
    `/seller/inquiries${query ? `?${query}` : ""}`,
  );

  return items.map(toInquiryListItem);
}

export async function getSellerInquiry(
  inquiryId: string,
): Promise<InquiryDetail> {
  if (useFixtures) {
    return { ...inquiryDetailFixture, id: inquiryId };
  }

  const [detail, timeline, submissions, confirmations] = await Promise.all([
    getJson<InquiryChatDetailResponse>(`/seller/inquiries/${inquiryId}`),
    getJson<InquiryTimelinePageResponse>(
      `/seller/inquiries/${inquiryId}/events?size=50`,
    ),
    getJson<InquiryOrderFormSubmissionResponse[]>(
      `/seller/inquiries/${inquiryId}/order-form-submissions`,
    ),
    getJson<InquiryOrderConfirmationResponse[]>(
      `/seller/inquiries/${inquiryId}/confirmations`,
    ),
  ]);

  return toInquiryDetail({
    confirmations,
    detail,
    submissions,
    timeline: timeline.items,
  });
}

export const markSellerInquiryRead = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/read`, "PATCH");

export const moveSellerInquiryToTrash = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/trash`, "PATCH");

export const restoreSellerInquiryFromTrash = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/restore`, "PATCH");

export const sendSellerOrderConfirmation = ({
  inquiryId,
  request,
}: {
  inquiryId: string;
  request: SendSellerOrderConfirmationRequest;
}) =>
  sendJson<InquiryOrderConfirmationResponse>(
    `/seller/inquiries/${inquiryId}/confirmations`,
    "POST",
    request,
  );
