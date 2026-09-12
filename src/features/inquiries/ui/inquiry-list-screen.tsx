"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type PointerEvent, useRef, useState } from "react";
import { Header } from "@/components/common/header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import { toInquiryStatusLabel } from "@/features/inquiries/model/inquiry-adapters";
import { useSellerInquiryListStomp } from "@/features/inquiries/model/inquiry-list-stomp";
import { useMoveSellerInquiryToTrashMutation } from "@/features/inquiries/model/inquiry-mutations";
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

const SWIPE_ACTION_WIDTH = 104;
const SWIPE_OPEN_THRESHOLD = 56;
const SWIPE_START_THRESHOLD = 8;

export function InquiryListScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openInquiryId, setOpenInquiryId] = useState<string | null>(null);
  const activeStatus = parseInquiryStatus(searchParams.get("status"));
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const inquiriesQuery = useSellerInquiriesQuery({
    status: activeStatus,
    unreadOnly,
  });
  const moveToTrashMutation = useMoveSellerInquiryToTrashMutation();
  const currentUserQuery = useCurrentUserQuery(
    Boolean(process.env.NEXT_PUBLIC_P3_API_BASE_URL),
  );
  useSellerInquiryListStomp(currentUserQuery.data?.userId);
  const inquiries = inquiriesQuery.data ?? [];

  const openInquiry = (inquiryId: string) => {
    router.push(`/seller/inquiries/${inquiryId}`);
  };

  const leaveInquiry = (inquiryId: string) => {
    setOpenInquiryId(null);
    moveToTrashMutation.mutate(inquiryId);
  };

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
              isLeaving={
                moveToTrashMutation.isPending &&
                moveToTrashMutation.variables === inquiry.id
              }
              key={inquiry.id}
              onConsult={() => openInquiry(inquiry.id)}
              onLeave={() => leaveInquiry(inquiry.id)}
              onOpenChange={(open) =>
                setOpenInquiryId(open ? inquiry.id : null)
              }
              open={openInquiryId === inquiry.id}
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
  isLeaving,
  onConsult,
  onLeave,
  onOpenChange,
  open,
  pressed,
}: {
  inquiry: InquiryListItem;
  isLeaving: boolean;
  onConsult: () => void;
  onLeave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pressed?: boolean;
}) {
  const pointerStateRef = useRef<{
    pointerId: number;
    startOffset: number;
    startX: number;
    startY: number;
    suppressClick: boolean;
    swiping: boolean;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const offset = isDragging ? dragOffset : open ? -SWIPE_ACTION_WIDTH : 0;

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStateRef.current = {
      pointerId: event.pointerId,
      startOffset: open ? -SWIPE_ACTION_WIDTH : 0,
      startX: event.clientX,
      startY: event.clientY,
      suppressClick: false,
      swiping: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const pointerState = pointerStateRef.current;

    if (!pointerState || pointerState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerState.startX;
    const deltaY = event.clientY - pointerState.startY;
    const absoluteDeltaX = Math.abs(deltaX);
    const absoluteDeltaY = Math.abs(deltaY);

    if (!pointerState.swiping) {
      if (
        absoluteDeltaY >= SWIPE_START_THRESHOLD &&
        absoluteDeltaY > absoluteDeltaX
      ) {
        pointerState.suppressClick = true;
        return;
      }

      if (
        absoluteDeltaX < SWIPE_START_THRESHOLD ||
        absoluteDeltaX <= absoluteDeltaY
      ) {
        return;
      }

      pointerState.swiping = true;
      setIsDragging(true);
    }

    event.preventDefault();
    pointerState.suppressClick = absoluteDeltaX >= SWIPE_START_THRESHOLD;
    setDragOffset(
      clamp(pointerState.startOffset + deltaX, -SWIPE_ACTION_WIDTH, 0),
    );
  };

  const handlePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const pointerState = pointerStateRef.current;

    if (!pointerState || pointerState.pointerId !== event.pointerId) {
      return;
    }

    if (pointerState.swiping) {
      const nextOffset = clamp(
        pointerState.startOffset + event.clientX - pointerState.startX,
        -SWIPE_ACTION_WIDTH,
        0,
      );
      onOpenChange(nextOffset <= -SWIPE_OPEN_THRESHOLD);
    }

    setIsDragging(false);
    setDragOffset(0);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    pointerStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleConsultClick = () => {
    if (pointerStateRef.current?.suppressClick) {
      pointerStateRef.current = null;
      return;
    }

    pointerStateRef.current = null;
    onConsult();
  };

  return (
    <div
      className="relative h-20 w-full overflow-hidden bg-surface-default"
      data-qa="inquiry-swipe-row"
    >
      <div
        aria-hidden={!open}
        className="absolute inset-y-0 right-4 flex items-center justify-end"
        data-qa="inquiry-swipe-actions"
      >
        <button
          className="flex size-[72px] items-center justify-center rounded-seller-md bg-brand-destructive text-center text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse disabled:opacity-40"
          data-qa="inquiry-leave-action"
          disabled={isLeaving}
          onClick={onLeave}
          tabIndex={open ? 0 : -1}
          type="button"
        >
          나가기
        </button>
      </div>
      <button
        aria-label={`${inquiry.buyerName} 상담 열기`}
        className={cn(
          "relative z-10 flex h-20 w-full touch-pan-y items-center gap-4 px-4 py-4 text-left transition-transform duration-200 ease-out",
          pressed || open ? "bg-surface-subtle" : "bg-surface-default",
          open && "rounded-seller-md",
          isDragging && "transition-none",
        )}
        data-qa="inquiry-row-button"
        onClick={handleConsultClick}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        style={{ transform: `translateX(${offset}px)` }}
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
                {inquiry.latestOrderFormSubmissionId ? (
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
    </div>
  );
}

function InquiryListState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-4 text-center text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-secondary">
      {message}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
