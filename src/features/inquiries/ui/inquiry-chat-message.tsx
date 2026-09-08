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
  onOpenOrderConfirmation: () => void;
  onOpenOrderForm: () => void;
  onOpenOrderHistory: () => void;
  onWriteOrderConfirmation: () => void;
}) {
  if (message.kind === "notice") {
    return (
      <div className="flex justify-center px-2">
        <p className="rounded-seller-lg bg-surface-default px-4 py-2 text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
          {message.text}
        </p>
      </div>
    );
  }

  if (message.kind === "order-request") {
    return (
      <BubbleRow
        buyerProfileImageUrl={buyerProfileImageUrl}
        owner="buyer"
        sentAt={message.sentAt}
      >
        <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
          <div className="space-y-1">
            <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
              주문서가 도착했어요
            </p>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
              주문서를 확인하고 주문확인서를 작성해주세요.
            </p>
          </div>
          <div className="space-y-2">
            <ActionButton onClick={onOpenOrderForm} variant="outline">
              주문서 보기
            </ActionButton>
            <ActionButton onClick={onWriteOrderConfirmation}>
              주문확인서 작성
            </ActionButton>
          </div>
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
              <p>{formatInquiryPrice(message.amount)}</p>
            </div>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              주문서를 확인해보세요
            </p>
          </div>
          <ActionButton onClick={onOpenOrderConfirmation} variant="outline">
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
              {formatInquiryPrice(message.amount)}을 보냈어요.
            </p>
            <p className="text-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              사장님께 결제금액을 보냈어요
            </p>
          </div>
          <ActionButton onClick={onOpenOrderHistory} variant="outline">
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

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "outline" | "primary";
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-seller-lg text-[15px] leading-5 font-semibold tracking-[-0.3px]",
        variant === "outline"
          ? "border border-border-default bg-surface-default text-text-primary"
          : "bg-brand-primary text-text-inverse",
      )}
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
