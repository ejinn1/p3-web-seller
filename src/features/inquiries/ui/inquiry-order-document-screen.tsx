"use client";

import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import type { InquiryDocumentMode } from "@/features/inquiries/model/inquiry-detail-state";
import type { InquiryOrderConfirmation } from "@/features/inquiries/model/inquiry-types";
import { InquiryOrderCard } from "@/features/inquiries/ui/inquiry-order-card";
import { cn } from "@/lib/utils";

export function InquiryOrderDocumentScreen({
  mode,
  onBack,
  onOpenPrice,
  onPrimary,
  order,
  paymentRequestDisabled = false,
  paymentRequestPending = false,
}: {
  mode: InquiryDocumentMode;
  onBack: () => void;
  onOpenPrice?: () => void;
  onPrimary?: () => void;
  order: InquiryOrderConfirmation;
  paymentRequestDisabled?: boolean;
  paymentRequestPending?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOrderForm = mode === "order-form";
  const isReadOnly = mode === "confirmation-view" || mode === "order-history";
  const isPrimaryDisabled =
    !isOrderForm && (paymentRequestDisabled || paymentRequestPending);

  return (
    <SellerResponsiveFrame className="h-dvh bg-surface-subtle">
      <DocumentHeader
        mode={mode}
        onBack={onBack}
        onMenu={() => setSidebarOpen(true)}
      />
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]"
        data-qa="document-scroll-area"
      >
        <InquiryOrderCard mode={mode} onOpenPrice={onOpenPrice} order={order} />
      </section>
      {!isReadOnly ? (
        <DocumentActions
          isOrderForm={isOrderForm}
          isPrimaryDisabled={isPrimaryDisabled}
          isPrimaryPending={paymentRequestPending}
          onPrimary={onPrimary}
        />
      ) : null}
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function DocumentHeader({
  mode,
  onBack,
  onMenu,
}: {
  mode: InquiryDocumentMode;
  onBack: () => void;
  onMenu: () => void;
}) {
  const title =
    mode === "order-form"
      ? "주문서"
      : mode === "order-history"
        ? "주문내역"
        : "주문 확인서";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-surface-default">
      <button
        aria-label="뒤로 가기"
        className="flex size-11 items-center justify-center text-text-secondary"
        onClick={onBack}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        {title}
      </h1>
      <button
        aria-label="메뉴"
        className="flex size-11 items-center justify-center text-text-secondary"
        onClick={onMenu}
        type="button"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
    </header>
  );
}

function DocumentActions({
  isOrderForm,
  isPrimaryDisabled,
  isPrimaryPending,
  onPrimary,
}: {
  isOrderForm: boolean;
  isPrimaryDisabled: boolean;
  isPrimaryPending: boolean;
  onPrimary?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-2 px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]",
        isOrderForm ? "bg-surface-default" : "bg-surface-subtle",
      )}
    >
      <button
        className="h-11 flex-1 rounded-seller-md border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
        type="button"
      >
        수정 요청
      </button>
      <button
        className={cn(
          "h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]",
          isPrimaryDisabled
            ? "bg-brand-disabled text-text-disabled"
            : "bg-brand-primary text-text-inverse",
        )}
        disabled={isPrimaryDisabled}
        onClick={onPrimary}
        type="button"
      >
        {isOrderForm
          ? "주문확인서 작성"
          : isPrimaryPending
            ? "요청 중"
            : "결제요청"}
      </button>
    </div>
  );
}
