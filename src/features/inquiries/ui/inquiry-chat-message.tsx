import type { ReactNode } from "react";
import type { InquiryChatMessage as InquiryChatMessageType } from "@/features/inquiries/model/inquiry-types";
import { formatInquiryPrice } from "@/features/inquiries/model/inquiry-order-confirmation";
import { ProfileImage } from "@/features/inquiries/ui/inquiry-list-screen";
import { cn } from "@/lib/utils";

export function InquiryChatMessage({
  buyerProfileImageUrl,
  message,
  onOpenOrderConfirmation,
  onOpenOrderForm,
  onOpenOrderHistory,
  onWriteOrderConfirmation,
}: {
  buyerProfileImageUrl: string | null;
  message: InquiryChatMessageType;
  onOpenOrderConfirmation: (confirmationId: string) => void;
  onOpenOrderForm: (submissionId: string) => void;
  onOpenOrderHistory: (orderId: string) => void;
  onWriteOrderConfirmation: (submissionId: string) => void;
}) {
  if (message.kind === "notice") {
    return <NoticeBubble>{message.text}</NoticeBubble>;
  }

  if (message.kind === "order-request") {
    return (
      <div className="flex flex-col gap-2 overflow-hidden">
        <BubbleRow
          buyerProfileImageUrl={buyerProfileImageUrl}
          owner="buyer"
          sentAt={message.sentAt}
        >
          <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-3">
            {message.imageUrl ? (
              <div className="aspect-square w-full overflow-hidden rounded-seller-lg bg-surface-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="주문 이미지"
                  className="size-full object-cover"
                  src={message.imageUrl}
                />
              </div>
            ) : null}
            <div className="space-y-1 px-1">
              <p className="text-[16px] leading-6 font-semibold tracking-[-0.32px] text-text-primary">
                {message.title}
              </p>
              <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
                {message.summary}
              </p>
            </div>
            <div className="space-y-2 px-1 pb-1">
              <ActionButton
                disabled={!message.submissionId}
                onClick={() => {
                  if (message.submissionId) {
                    onOpenOrderForm(message.submissionId);
                  }
                }}
                variant="outline"
              >
                주문서 보기
              </ActionButton>
              <ActionButton
                disabled={!message.submissionId || !message.sellerViewed}
                onClick={() => {
                  if (message.submissionId) {
                    onWriteOrderConfirmation(message.submissionId);
                  }
                }}
              >
                주문확인서 작성
              </ActionButton>
            </div>
          </div>
        </BubbleRow>
        <NoticeBubble>{message.receivedNoticeText}</NoticeBubble>
      </div>
    );
  }

  if (message.kind === "order-form-revision-request") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="seller"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="flex w-[208px] flex-col gap-2">
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
              수정 요청
            </p>
            <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
              주문서를 수정해주세요
            </p>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
              주문서 수정을 요청했어요
            </p>
          </div>
          <ActionButton disabled variant="outline">
            주문서 수정하기
          </ActionButton>
        </div>
      </BubbleRow>
    );
  }

  if (message.kind === "payment-request") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="seller"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="space-y-2">
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
              결제 요청
            </p>
            <div className="flex items-center justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
              <p>최종 가격</p>
              <p>
                {message.amount === null
                  ? "금액 확인 중"
                  : formatInquiryPrice(message.amount)}
              </p>
            </div>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              주문서를 확인해보세요
            </p>
          </div>
          <ActionButton
            onClick={() => onOpenOrderConfirmation(message.confirmationId)}
            variant="outline"
          >
            주문확인서 보기
          </ActionButton>
        </div>
      </BubbleRow>
    );
  }

  if (message.kind === "payment-complete") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="buyer"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="space-y-2">
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
              결제 완료
            </p>
            <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
              {message.amount === null
                ? "결제를 완료했어요."
                : `${formatInquiryPrice(message.amount)}을 보냈어요.`}
            </p>
            <p className="text-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              사장님께 결제금액을 보냈어요
            </p>
          </div>
          <ActionButton
            onClick={() => onOpenOrderHistory(message.orderId)}
            variant="outline"
          >
            주문내역 보기
          </ActionButton>
        </div>
      </BubbleRow>
    );
  }

  if (message.kind === "refund-request") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="buyer"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="space-y-2">
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
              취소 요청
            </p>
            <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
              취소 요청을 접수했어요
            </p>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              주문 내역에서 환불 처리를 진행해주세요
            </p>
          </div>
          <ActionButton
            disabled={!message.orderId}
            onClick={() => onOpenOrderHistory(message.orderId)}
            variant="outline"
          >
            주문내역 보기
          </ActionButton>
        </div>
      </BubbleRow>
    );
  }

  if (message.kind === "refund-complete") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="seller"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="space-y-2">
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
              취소 완료
            </p>
            <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
              {message.amount === null
                ? "환불됐어요"
                : `${formatInquiryPrice(message.amount)}이 환불됐어요`}
            </p>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              취소 처리가 완료되었습니다
            </p>
          </div>
          <ActionButton
            disabled={!message.orderId}
            onClick={() => onOpenOrderHistory(message.orderId)}
            variant="outline"
          >
            주문내역 보기
          </ActionButton>
        </div>
      </BubbleRow>
    );
  }

  return (
    <BubbleRow
      buyerProfileImageUrl={buyerProfileImageUrl}
      owner={message.owner}
      sentAt={message.sentAt}
      unreadCount={message.unreadCount}
    >
      <p
        className={cn(
          "max-w-[232px] shrink-0 rounded-seller-lg px-4 py-2 text-[16px] leading-6 font-normal tracking-[-0.32px] whitespace-pre-wrap",
          message.owner === "seller"
            ? "bg-surface-inverse text-text-inverse"
            : "bg-surface-default text-text-primary",
        )}
      >
        {message.text}
      </p>
    </BubbleRow>
  );
}

function NoticeBubble({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[34px] w-full items-center justify-center overflow-hidden px-2"
      data-ui="order-received-notice"
    >
      <p className="rounded-seller-lg bg-surface-default px-4 py-2 text-[13px] leading-[18px] font-normal tracking-[-0.13px] whitespace-nowrap text-text-secondary">
        {children}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "outline" | "primary";
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-seller-lg text-[15px] leading-5 font-semibold tracking-[-0.3px]",
        variant === "outline"
          ? "border border-border-default bg-surface-default text-text-primary"
          : "bg-brand-primary text-text-inverse",
        disabled && variant === "primary" && "bg-brand-disabled",
        disabled && "text-text-disabled",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function BubbleRow({
  buyerProfileImageUrl,
  children,
  owner,
  sentAt,
  unreadCount,
}: {
  buyerProfileImageUrl: string | null;
  children: ReactNode;
  owner: "buyer" | "seller";
  sentAt: string;
  unreadCount?: number;
}) {
  const isSeller = owner === "seller";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-1 overflow-hidden",
        isSeller ? "justify-end pr-2 pl-12" : "justify-start pr-10 pl-2",
      )}
    >
      {isSeller ? (
        <BubbleTime sentAt={sentAt} unreadCount={unreadCount} />
      ) : null}
      {!isSeller ? (
        <ProfileImage imageUrl={buyerProfileImageUrl} size={40} />
      ) : null}
      {children}
      {!isSeller ? <BubbleTime sentAt={sentAt} /> : null}
    </div>
  );
}

function BubbleTime({
  sentAt,
  unreadCount,
}: {
  sentAt: string;
  unreadCount?: number;
}) {
  return (
    <div className="w-[54px] shrink-0 text-[11px] leading-4 font-medium tracking-[-0.11px]">
      {unreadCount ? <p className="text-text-primary">{unreadCount}</p> : null}
      <time className="text-text-tertiary">{sentAt}</time>
    </div>
  );
}
