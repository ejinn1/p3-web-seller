"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import type { InquiryDetail } from "@/features/inquiries/model/inquiry-types";
import { InquiryChatComposer } from "@/features/inquiries/ui/inquiry-chat-composer";
import { InquiryChatMessage } from "@/features/inquiries/ui/inquiry-chat-message";

export function InquiryChatScreen({
  connectionError,
  hasOlderMessages,
  inquiry,
  isConnected,
  isLoadingOlderMessages,
  onBack,
  onOpenOrderConfirmation,
  onOpenOrderForm,
  onOpenOrderHistory,
  onLoadOlderMessages,
  onSend,
  onWriteOrderConfirmation,
}: {
  connectionError?: string;
  hasOlderMessages: boolean;
  inquiry: InquiryDetail;
  isConnected: boolean;
  isLoadingOlderMessages: boolean;
  onBack: () => void;
  onOpenOrderConfirmation: (confirmationId: string) => void;
  onOpenOrderForm: (submissionId: string) => void;
  onOpenOrderHistory: (orderId: string) => void;
  onLoadOlderMessages: () => void;
  onSend: (content: string) => void;
  onWriteOrderConfirmation: (submissionId: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);
  const initializedRef = useRef(false);
  const nearBottomRef = useRef(true);
  const previousLatestMessageIdRef = useRef(inquiry.messages.at(-1)?.id);
  const previousOldestMessageIdRef = useRef(inquiry.messages.at(0)?.id);
  const prependSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const loadRequestedRef = useRef(false);
  const writeOrderConfirmationDisabled = inquiry.status === "WAITING";

  useLayoutEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    const latestMessageId = inquiry.messages.at(-1)?.id;
    const oldestMessageId = inquiry.messages.at(0)?.id;

    if (!initializedRef.current) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
      initializedRef.current = true;
    } else if (
      previousOldestMessageIdRef.current !== oldestMessageId &&
      prependSnapshotRef.current
    ) {
      const snapshot = prependSnapshotRef.current;
      scrollArea.scrollTop =
        snapshot.scrollTop + (scrollArea.scrollHeight - snapshot.scrollHeight);
      prependSnapshotRef.current = null;
      loadRequestedRef.current = false;
    } else if (
      previousLatestMessageIdRef.current !== latestMessageId &&
      nearBottomRef.current
    ) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }

    previousLatestMessageIdRef.current = latestMessageId;
    previousOldestMessageIdRef.current = oldestMessageId;
  }, [inquiry.messages]);

  useEffect(() => {
    if (!isLoadingOlderMessages) {
      loadRequestedRef.current = false;
    }
  }, [isLoadingOlderMessages]);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (
      !scrollArea ||
      !hasOlderMessages ||
      isLoadingOlderMessages ||
      loadRequestedRef.current ||
      scrollArea.scrollHeight > scrollArea.clientHeight + 80
    ) {
      return;
    }

    prependSnapshotRef.current = {
      scrollHeight: scrollArea.scrollHeight,
      scrollTop: scrollArea.scrollTop,
    };
    loadRequestedRef.current = true;
    onLoadOlderMessages();
  }, [hasOlderMessages, inquiry.messages, isLoadingOlderMessages, onLoadOlderMessages]);

  const handleScroll = () => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    nearBottomRef.current =
      scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight <= 80;

    if (
      scrollArea.scrollTop <= 80 &&
      hasOlderMessages &&
      !isLoadingOlderMessages &&
      !loadRequestedRef.current
    ) {
      prependSnapshotRef.current = {
        scrollHeight: scrollArea.scrollHeight,
        scrollTop: scrollArea.scrollTop,
      };
      loadRequestedRef.current = true;
      onLoadOlderMessages();
    }
  };

  return (
    <SellerResponsiveFrame className="h-dvh bg-surface-subtle">
      <ChatHeader
        inquiry={inquiry}
        onBack={onBack}
        onMenu={() => setSidebarOpen(true)}
      />
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle pb-6"
        data-qa="chat-scroll-area"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        <ChatDate createdAt={inquiry.createdAt} />
        <div className="flex flex-col gap-8">
          {inquiry.messages.map((message) => (
            <InquiryChatMessage
              buyerProfileImageUrl={inquiry.profileImageUrl}
              key={message.id}
              message={message}
              onOpenOrderConfirmation={onOpenOrderConfirmation}
              onOpenOrderForm={onOpenOrderForm}
              onOpenOrderHistory={onOpenOrderHistory}
              writeOrderConfirmationDisabled={writeOrderConfirmationDisabled}
              onWriteOrderConfirmation={onWriteOrderConfirmation}
            />
          ))}
        </div>
      </section>
      <InquiryChatComposer disabled={!isConnected} onSend={onSend} />
      {connectionError ? (
        <p className="sr-only">채팅 연결 오류: {connectionError}</p>
      ) : null}
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function ChatHeader({
  inquiry,
  onBack,
  onMenu,
}: {
  inquiry: InquiryDetail;
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 shrink-0 bg-surface-default">
      <div className="flex h-14 items-center justify-between">
        <button
          aria-label="뒤로 가기"
          className="flex size-11 items-center justify-center text-text-secondary"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
          {inquiry.buyerName}
        </h1>
        <button
          aria-label="메뉴"
          className="flex size-11 items-center justify-center text-text-secondary"
          onClick={onMenu}
          type="button"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="flex h-10 items-center justify-between px-4 py-2">
        <p className="text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
          {inquiry.chatInfo}
        </p>
        <span className="rounded-seller-sm bg-surface-subtle px-2 py-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
          {inquiry.statusLabel}
        </span>
      </div>
    </header>
  );
}

function ChatDate({ createdAt }: { createdAt: string }) {
  return (
    <div className="flex h-8 items-start justify-center pt-4">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {new Intl.DateTimeFormat("ko-KR", {
          day: "numeric",
          month: "long",
          weekday: "long",
        }).format(new Date(createdAt))}
      </p>
    </div>
  );
}
