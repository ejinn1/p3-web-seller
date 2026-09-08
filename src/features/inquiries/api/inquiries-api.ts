import { getJson, sendJson } from "@/lib/api/client";
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

const pendingOrderConfirmationRequests = new Map<
  string,
  Promise<InquiryOrderConfirmationResponse>
>();

export async function getSellerInquiries(
  params: SellerInquiryListParams = {},
): Promise<InquiryListItem[]> {
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
  const [detail, timeline, submissions, confirmations, listItems, trashItems] =
    await Promise.all([
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
      getJson<InquiryListApiItem[]>("/seller/inquiries"),
      getJson<InquiryListApiItem[]>("/seller/inquiries?status=TRASH"),
    ]);
  const status = [...listItems, ...trashItems].find(
    (item) => item.inquiryId === inquiryId,
  )?.status;

  return toInquiryDetail({
    confirmations,
    detail,
    submissions,
    status,
    timeline: timeline.items,
  });
}

export const markSellerInquiryRead = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/read`, "PATCH");

export const getSellerOrderFormSubmission = (
  inquiryId: string,
  submissionId: string,
) =>
  getJson<InquiryOrderFormSubmissionResponse>(
    `/seller/inquiries/${inquiryId}/order-form-submissions/${submissionId}`,
  );

export const moveSellerInquiryToTrash = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/trash`, "PATCH");

export const restoreSellerInquiryFromTrash = (inquiryId: string) =>
  sendJson<void>(`/seller/inquiries/${inquiryId}/restore`, "PATCH");

export function sendSellerOrderConfirmation({
  inquiryId,
  request,
}: {
  inquiryId: string;
  request: SendSellerOrderConfirmationRequest;
}) {
  const pendingRequest = pendingOrderConfirmationRequests.get(inquiryId);

  if (pendingRequest) {
    return pendingRequest;
  }

  const nextRequest = sendJson<InquiryOrderConfirmationResponse>(
    `/seller/inquiries/${inquiryId}/confirmations`,
    "POST",
    request,
  );

  pendingOrderConfirmationRequests.set(inquiryId, nextRequest);

  const clearPendingRequest = () => {
    if (pendingOrderConfirmationRequests.get(inquiryId) === nextRequest) {
      pendingOrderConfirmationRequests.delete(inquiryId);
    }
  };

  void nextRequest.then(clearPendingRequest, clearPendingRequest);

  return nextRequest;
}
