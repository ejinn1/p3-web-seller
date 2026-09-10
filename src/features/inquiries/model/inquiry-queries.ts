"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSellerInquiries,
  getSellerInquiry,
  getSellerInquiryTimeline,
} from "@/features/inquiries/api/inquiries-api";
import { inquiryKeys } from "@/features/inquiries/model/inquiry-keys";
import type {
  InquiryTimelinePageResponse,
  SellerInquiryListParams,
} from "@/features/inquiries/model/inquiry-types";

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

type InquiryTimelineCursor = {
  cursorCreatedAt: string;
  cursorId: string;
};

export function useSellerInquiryTimelineQuery(inquiryId: string) {
  return useInfiniteQuery({
    getNextPageParam: getNextTimelineCursor,
    initialPageParam: undefined as InquiryTimelineCursor | undefined,
    queryFn: ({ pageParam }) =>
      getSellerInquiryTimeline(inquiryId, { size: 50, ...pageParam }),
    queryKey: inquiryKeys.timeline(inquiryId),
  });
}

function getNextTimelineCursor(
  page: InquiryTimelinePageResponse,
): InquiryTimelineCursor | undefined {
  if (!page.hasNext || !page.nextCursorCreatedAt || !page.nextCursorId) {
    return undefined;
  }

  return {
    cursorCreatedAt: page.nextCursorCreatedAt,
    cursorId: page.nextCursorId,
  };
}
