"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/common/header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import { toInquiryStatusLabel } from "@/features/inquiries/model/inquiry-adapters";
import { useSellerInquiryListStomp } from "@/features/inquiries/model/inquiry-list-stomp";
import { useSellerInquiriesQuery } from "@/features/inquiries/model/inquiry-queries";
import type {
  InquiryListItem,
  InquiryStatus,
} from "@/features/inquiries/model/inquiry-types";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";
import { cn } from "@/lib/utils";

const tabs: Array<{ label: string; status?: InquiryStatus }> = [
  { label: "전체" },
  { label: toInquiryStatusLabel("WAITING"), status: "WAITING" },
  { label: toInquiryStatusLabel("IN_PROGRESS"), status: "IN_PROGRESS" },
  { label: toInquiryStatusLabel("PAID"), status: "PAID" },
  { label: toInquiryStatusLabel("PICKED_UP"), status: "PICKED_UP" },
  { label: toInquiryStatusLabel("TRASH"), status: "TRASH" },
];

export function InquiryListScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeStatus = parseInquiryStatus(searchParams.get("status"));
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const inquiriesQuery = useSellerInquiriesQuery({
    status: activeStatus,
    unreadOnly,
  });
  const currentUserQuery = useCurrentUserQuery(
    Boolean(process.env.NEXT_PUBLIC_P3_API_BASE_URL),
  );
  useSellerInquiryListStomp(currentUserQuery.data?.userId);
  const inquiries = inquiriesQuery.data ?? [];

  return (
    <SellerResponsiveFrame className="bg-surface-default">
      <Header
        backHref={getSellerBackHref("inquiries")}
        backLabel="판매자 홈으로 돌아가기"
        className="border-none"
        onMenu={() => setSidebarOpen(true)}
        showMenu
        title="문의 목록"
      />
      <section className="min-h-0 flex-1 overflow-y-auto bg-surface-default py-2">
        <div className="flex h-[68px] [scrollbar-width:none] gap-2 overflow-x-auto px-4 pt-4 pb-2 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              className={cn(
                "h-11 shrink-0 rounded-seller-sm px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px]",
                tab.status === activeStatus || (!tab.status && !activeStatus)
                  ? "bg-surface-inverse text-text-inverse"
                  : "bg-surface-subtle text-text-secondary",
              )}
              key={tab.label}
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);

                if (tab.status) {
                  nextParams.set("status", tab.status);
                } else {
                  nextParams.delete("status");
                }

                const query = nextParams.toString();
                router.push(
                  query ? `/seller/inquiries?${query}` : "/seller/inquiries",
                );
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        {inquiriesQuery.isLoading ? (
          <InquiryListState message="문의 목록을 불러오는 중입니다." />
        ) : inquiriesQuery.isError ? (
          <InquiryListState message="문의 목록을 불러오지 못했습니다." />
        ) : inquiries.length === 0 ? (
          <InquiryListState message="아직 표시할 문의가 없습니다." />
        ) : null}
        <div>
          {inquiries.map((inquiry, index) => (
            <InquiryRow
              inquiry={inquiry}
              key={inquiry.id}
              onClick={() => router.push(`/seller/inquiries/${inquiry.id}`)}
              pressed={index === 1}
            />
          ))}
        </div>
      </section>
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function InquiryRow({
  inquiry,
  onClick,
  pressed,
}: {
  inquiry: InquiryListItem;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-20 w-full items-center gap-4 px-4 py-4 text-left",
        pressed ? "bg-surface-subtle" : "bg-surface-default",
      )}
      onClick={onClick}
      type="button"
    >
      <ProfileImage imageUrl={inquiry.profileImageUrl} size={48} />
      <div className="min-w-0 flex-1 self-stretch">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
                {inquiry.buyerName}
              </p>
              {inquiry.unreadCount > 0 ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-destructive px-[3px] text-center text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-inverse">
                  {inquiry.unreadCount}
                </span>
              ) : null}
              {inquiry.hasOrderFormSubmission ? (
                <span className="rounded-seller-sm bg-brand-subtle px-1.5 py-0.5 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
                  주문서
                </span>
              ) : null}
              <span className="shrink-0 rounded-seller-sm bg-surface-subtle px-1.5 py-0.5 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
                {inquiry.statusLabel}
              </span>
            </div>
            <p className="truncate text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-secondary">
              {inquiry.lastMessage}
            </p>
          </div>
          <time className="w-11 shrink-0 text-right text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
            {inquiry.lastMessageTimeLabel}
          </time>
        </div>
      </div>
    </button>
  );
}

function InquiryListState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-4 text-center text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-secondary">
      {message}
    </div>
  );
}

export function ProfileImage({
  imageUrl,
  size,
}: {
  imageUrl: string | null;
  size: 40 | 48;
}) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-seller-sm border border-border-default bg-surface-default"
      style={{ height: size, width: size }}
    >
      {imageUrl ? (
        <Image
          alt=""
          className="object-cover"
          fill
          unoptimized
          sizes={`${size}px`}
          src={imageUrl}
        />
      ) : (
        <span className="relative size-8">
          <Image
            alt=""
            className="object-contain"
            fill
            sizes="32px"
            src="/inquiries/profile-fallback.svg"
          />
        </span>
      )}
    </span>
  );
}

function parseInquiryStatus(value: string | null): InquiryStatus | undefined {
  if (
    value === "WAITING" ||
    value === "IN_PROGRESS" ||
    value === "PAID" ||
    value === "PICKED_UP" ||
    value === "TRASH"
  ) {
    return value;
  }

  return undefined;
}
