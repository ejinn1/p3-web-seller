"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, Plus, X } from "lucide-react";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { useSellerInquiryQuery } from "@/features/inquiries/model/inquiry-queries";
import { useSellerInquiryStomp } from "@/features/inquiries/model/inquiry-stomp";
import type {
  InquiryChatMessage,
  InquiryDetail,
  InquiryOrderConfirmation,
  InquiryOrderOption,
} from "@/features/inquiries/model/inquiry-types";
import { ProfileImage } from "@/features/inquiries/ui/inquiry-list-screen";
import { cn } from "@/lib/utils";

type InquiryScreenState =
  | "chat"
  | "order-form"
  | "confirmation-draft"
  | "confirmation-priced"
  | "payment-requested"
  | "payment-completed"
  | "order-history"
  | "confirmation-view";

export function InquiryDetailScreen({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryQuery = useSellerInquiryQuery(inquiryId);
  const inquiry = inquiryQuery.data;
  const state = (searchParams.get("state") ?? "chat") as InquiryScreenState;
  const sheet = searchParams.get("sheet");
  const modal = searchParams.get("modal");
  const chatScrollRef = useRef<HTMLElement>(null);
  const stomp = useSellerInquiryStomp(inquiryId, Boolean(inquiry));

  const messages = useMemo(
    () => (inquiry ? buildMessages(inquiry, state) : []),
    [inquiry, state],
  );

  useEffect(() => {
    const scrollArea = chatScrollRef.current;

    if (!scrollArea || messages.length <= 2) {
      return;
    }

    scrollArea.scrollTop = scrollArea.scrollHeight;
  }, [messages.length]);

  if (!inquiry) {
    return (
      <SellerResponsiveFrame className="items-center justify-center bg-surface-subtle text-[16px] leading-6 tracking-[-0.32px] text-text-secondary">
        상담을 불러오는 중입니다.
      </SellerResponsiveFrame>
    );
  }

  if (state === "order-form") {
    return (
      <OrderDocumentScreen
        inquiry={inquiry}
        mode="order-form"
        onBack={() => setState(router, inquiryId, "chat")}
        onPrimary={() => setState(router, inquiryId, "confirmation-draft")}
      />
    );
  }

  if (
    state === "confirmation-draft" ||
    state === "confirmation-priced" ||
    state === "confirmation-view" ||
    state === "order-history"
  ) {
    return (
      <>
        <OrderDocumentScreen
          inquiry={inquiry}
          mode={state}
          onBack={() => setState(router, inquiryId, "chat")}
          onOpenPrice={() =>
            router.push(
              `/seller/inquiries/${inquiryId}?state=confirmation-draft&sheet=price`,
            )
          }
          onPrimary={() =>
            router.push(
              `/seller/inquiries/${inquiryId}?state=confirmation-priced&modal=payment-request`,
            )
          }
        />
        {sheet === "price" ? (
          <PriceSheet
            onClose={() => setState(router, inquiryId, "confirmation-draft")}
            onConfirm={() => setState(router, inquiryId, "confirmation-priced")}
          />
        ) : null}
        {modal === "payment-request" ? (
          <PaymentRequestModal
            onCancel={() => setState(router, inquiryId, "confirmation-priced")}
            onConfirm={() => setState(router, inquiryId, "payment-requested")}
          />
        ) : null}
      </>
    );
  }

  return (
    <SellerResponsiveFrame className="h-dvh bg-surface-subtle">
      <ChatHeader
        inquiry={inquiry}
        title={
          state === "payment-requested" || state === "payment-completed"
            ? "위하다"
            : inquiry.buyerName
        }
        onBack={() => router.push("/seller/inquiries")}
      />
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle pb-6"
        data-qa="chat-scroll-area"
        ref={chatScrollRef}
      >
        <DateArea />
        <div className="flex flex-col gap-8">
          {messages.map((message) => (
            <ChatMessage
              buyerProfileImageUrl={inquiry.profileImageUrl}
              inquiryId={inquiryId}
              key={message.id}
              message={message}
              state={state}
            />
          ))}
        </div>
      </section>
      <ChatComposer
        disabled={
          !stomp.isConnected && Boolean(process.env.NEXT_PUBLIC_P3_API_BASE_URL)
        }
        onSend={stomp.sendMessage}
      />
      {stomp.error ? (
        <p className="sr-only">채팅 연결 오류: {stomp.error.message}</p>
      ) : null}
    </SellerResponsiveFrame>
  );
}

function ChatHeader({
  inquiry,
  title,
  onBack,
}: {
  inquiry: InquiryDetail;
  title: string;
  onBack: () => void;
}) {
  return (
    <header className="shrink-0 bg-surface-default">
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
          {title}
        </h1>
        <button
          aria-label="메뉴"
          className="flex size-11 items-center justify-center text-text-secondary"
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

function DateArea() {
  return (
    <div className="flex h-8 items-start justify-center pt-4">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        8월 14일 금요일
      </p>
    </div>
  );
}

function ChatMessage({
  buyerProfileImageUrl,
  inquiryId,
  message,
  state,
}: {
  buyerProfileImageUrl: string | null;
  inquiryId: string;
  message: InquiryChatMessage;
  state: InquiryScreenState;
}) {
  const router = useRouter();

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
          <div className="relative size-52 overflow-hidden rounded-seller-sm">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="208px"
              src="/inquiries/cake-request.png"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
              케이크 2호 사이즈
            </p>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
              원형 / 바닐라시트 + 생크림
            </p>
          </div>
          <div className="space-y-2">
            <button
              className="flex h-9 w-full items-center justify-center rounded-seller-lg border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
              onClick={() =>
                router.push(`/seller/inquiries/${inquiryId}?state=order-form`)
              }
              type="button"
            >
              주문서 보기
            </button>
            <button
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-seller-lg text-[15px] leading-5 font-semibold tracking-[-0.3px]",
                state === "chat"
                  ? "bg-brand-primary text-text-inverse"
                  : "bg-brand-disabled text-text-disabled",
              )}
              onClick={() =>
                router.push(
                  `/seller/inquiries/${inquiryId}?state=confirmation-draft`,
                )
              }
              type="button"
            >
              주문확인서 작성
            </button>
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
              <p>{formatPrice(message.amount)}</p>
            </div>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              주문서를 확인해보세요
            </p>
          </div>
          <button
            className="flex h-9 w-full items-center justify-center rounded-seller-lg border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            onClick={() =>
              router.push(
                `/seller/inquiries/${inquiryId}?state=confirmation-view`,
              )
            }
            type="button"
          >
            주문확인서 보기
          </button>
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
              {formatPrice(message.amount)}을 보냈어요.
            </p>
            <p className="text-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
              위하다 사장님께 결제금액을 보냈어요
            </p>
          </div>
          <button
            className="flex h-9 w-full items-center justify-center rounded-seller-lg border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            onClick={() =>
              router.push(`/seller/inquiries/${inquiryId}?state=order-history`)
            }
            type="button"
          >
            주문내역 보기
          </button>
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

function BubbleRow({
  buyerProfileImageUrl,
  children,
  owner,
  sentAt,
  unreadCount,
}: {
  buyerProfileImageUrl: string | null;
  children: React.ReactNode;
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

function ChatComposer({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="shrink-0 bg-surface-elevated px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] shadow-[0_-12px_12px_rgba(0,0,0,0.04)]"
      onSubmit={(event) => {
        event.preventDefault();
        const content = value.trim();

        if (!content || disabled) {
          return;
        }

        onSend(content);
        setValue("");
      }}
    >
      <label className="sr-only" htmlFor="seller-chat-message">
        메시지 입력
      </label>
      <div className="flex h-[52px] items-center gap-2 rounded-seller-lg border border-border-default bg-surface-subtle p-2">
        <button
          aria-label="파일 추가"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-default text-text-disabled"
          type="button"
        >
          <Plus aria-hidden="true" className="size-6" />
        </button>
        <input
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary outline-none placeholder:text-text-unavailable"
          disabled={disabled}
          id="seller-chat-message"
          onChange={(event) => setValue(event.target.value)}
          placeholder="메시지 입력"
          value={value}
        />
        <button className="sr-only" disabled={disabled} type="submit">
          보내기
        </button>
      </div>
    </form>
  );
}

function OrderDocumentScreen({
  inquiry,
  mode,
  onBack,
  onOpenPrice,
  onPrimary,
}: {
  inquiry: InquiryDetail;
  mode:
    | "order-form"
    | "confirmation-draft"
    | "confirmation-priced"
    | "confirmation-view"
    | "order-history";
  onBack: () => void;
  onOpenPrice?: () => void;
  onPrimary?: () => void;
}) {
  const isOrderForm = mode === "order-form";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDraft = mode === "confirmation-draft";
  const isPriced =
    mode === "confirmation-priced" ||
    mode === "confirmation-view" ||
    mode === "order-history";

  return (
    <SellerResponsiveFrame className="h-dvh bg-surface-subtle">
      <DocumentHeader
        onBack={onBack}
        onMenu={() => setSidebarOpen(true)}
        showMenu={!isOrderForm}
        title={
          isOrderForm
            ? "주문서"
            : mode === "order-history"
              ? "주문내역"
              : "주문 확인서"
        }
      />
      <section
        className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]"
        data-qa="document-scroll-area"
      >
        <OrderCard
          mode={mode}
          onOpenPrice={onOpenPrice}
          order={inquiry.order}
          showFinalTotal={isPriced && !isOrderForm}
        />
      </section>
      {isOrderForm ? (
        <div className="flex shrink-0 gap-2 bg-surface-default px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
          <button
            className="h-11 flex-1 rounded-seller-md border border-border-strong bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            type="button"
          >
            수정 요청
          </button>
          <button
            className="h-11 flex-1 rounded-seller-md bg-brand-primary text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse"
            onClick={onPrimary}
            type="button"
          >
            주문확인서 작성
          </button>
        </div>
      ) : mode === "confirmation-view" || mode === "order-history" ? null : (
        <div className="flex shrink-0 gap-2 bg-surface-subtle px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
          <button
            className="h-11 flex-1 rounded-seller-md border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            type="button"
          >
            수정 요청
          </button>
          <button
            className={cn(
              "h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]",
              isDraft
                ? "bg-brand-disabled text-text-disabled"
                : "bg-brand-primary text-text-inverse",
            )}
            disabled={isDraft}
            onClick={onPrimary}
            type="button"
          >
            결제요청
          </button>
        </div>
      )}
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function DocumentHeader({
  onBack,
  onMenu,
  showMenu,
  title,
}: {
  onBack: () => void;
  onMenu: () => void;
  showMenu: boolean;
  title: string;
}) {
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
      {showMenu ? (
        <button
          aria-label="메뉴"
          className="flex size-11 items-center justify-center text-text-secondary"
          onClick={onMenu}
          type="button"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      ) : (
        <div className="size-11" />
      )}
    </header>
  );
}

function OrderCard({
  mode,
  onOpenPrice,
  order,
  showFinalTotal,
}: {
  mode:
    | "order-form"
    | "confirmation-draft"
    | "confirmation-priced"
    | "confirmation-view"
    | "order-history";
  onOpenPrice?: () => void;
  order: InquiryOrderConfirmation;
  showFinalTotal?: boolean;
}) {
  const isOrderForm = mode === "order-form";

  if (isOrderForm) {
    return <OrderFormCard onOpenPrice={onOpenPrice} order={order} />;
  }

  return (
    <article className="w-full rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        <p>{order.pickupDate}</p>
        <p>{order.pickupTime}</p>
      </div>
      <div className="mt-8 space-y-1">
        <InfoLine label="주문자" value={order.buyerName} />
        <InfoLine label="연락처" value={order.buyerPhone} />
      </div>
      <div className="mt-8 h-px bg-surface-subtle opacity-90" />
      <div className="mt-8 space-y-6">
        {order.options.map((option) => (
          <OrderOptionRow
            isOrderForm={false}
            key={option.id}
            mode={mode}
            onOpenPrice={option.needsPrice ? onOpenPrice : undefined}
            option={option}
          />
        ))}
      </div>
      {showFinalTotal ? (
        <>
          <div className="h-px bg-surface-subtle opacity-90" />
          <div className="flex items-center justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            <p>최종 가격</p>
            <p>{formatPrice(order.totalPrice)}</p>
          </div>
        </>
      ) : null}
    </article>
  );
}

function OrderFormCard({
  onOpenPrice,
  order,
}: {
  onOpenPrice?: () => void;
  order: InquiryOrderConfirmation;
}) {
  return (
    <article className="min-h-[696px] w-full rounded-seller-sm bg-surface-default px-4 pt-6 pb-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="space-y-12">
        <OrderFormSection
          price={order.pickupTime}
          title="픽업 일시"
          value={order.pickupDate}
        />
        {order.options
          .filter((option) => option.id !== "design")
          .map((option) => (
            <OrderFormSection
              key={option.id}
              onClick={option.needsPrice ? onOpenPrice : undefined}
              price={formatOrderFormPrice(option)}
              required={option.required}
              title={option.label === "사이즈" ? "사이즈" : option.label}
              value={option.value}
            />
          ))}
      </div>
    </article>
  );
}

function formatOrderFormPrice(option: InquiryOrderOption) {
  if (option.id === "size") {
    return "+ 38,000원 ~";
  }

  if (option.id === "extra") {
    return "문의 필요";
  }

  return option.priceText
    .replace("+ 3000원", "+ 3,000원 ~")
    .replace("+ 4000원", "+ 4,000원 ~");
}

function OrderFormSection({
  onClick,
  price,
  required,
  title,
  value,
}: {
  onClick?: () => void;
  price: string;
  required?: boolean;
  title: string;
  value: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-1 text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {title}
        {required ? (
          <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
      </h2>
      <button
        className="flex h-6 w-full items-center gap-4 text-left"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        <span className="relative size-4 shrink-0 rounded-full border-2 border-border-default">
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-default" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary">
          {value}
        </span>
        <span
          className={cn(
            "shrink-0 text-right text-[15px] leading-[22px] font-semibold tracking-[-0.15px]",
            title === "픽업 일시" ? "text-text-secondary" : "text-text-primary",
          )}
        >
          {price}
        </span>
      </button>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {value}
      </p>
    </div>
  );
}

function OrderOptionRow({
  isOrderForm,
  mode,
  onOpenPrice,
  option,
}: {
  isOrderForm: boolean;
  mode:
    | "order-form"
    | "confirmation-draft"
    | "confirmation-priced"
    | "confirmation-view"
    | "order-history";
  onOpenPrice?: () => void;
  option: InquiryOrderOption;
}) {
  const needsPrice = mode === "confirmation-draft" && option.needsPrice;
  const showPrice =
    !isOrderForm && (!option.needsPrice || mode !== "confirmation-draft");

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {option.label}
        {isOrderForm && option.required ? (
          <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
      </p>
      <button
        className="flex min-h-6 w-full items-center justify-between text-left"
        disabled={!onOpenPrice}
        onClick={onOpenPrice}
        type="button"
      >
        <span className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {option.value}
        </span>
        {showPrice ? (
          <span className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-disabled">
            {option.priceText}
          </span>
        ) : option.needsPrice && !isOrderForm ? (
          <ChevronRight
            aria-hidden="true"
            className="size-6 text-text-secondary"
          />
        ) : null}
      </button>
      {option.id === "design" && !isOrderForm ? (
        <div className="relative size-[100px] overflow-hidden rounded-seller-sm">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="100px"
            src="/inquiries/cake-attachment.png"
          />
        </div>
      ) : null}
      {needsPrice ? (
        <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-error">
          가격을 입력해주세요
        </p>
      ) : null}
    </div>
  );
}

function PriceSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const searchParams = useSearchParams();
  const startsComplete = searchParams.get("priceState") === "complete";
  const [hasEditedPrice, setHasEditedPrice] = useState(startsComplete);
  const isComplete = startsComplete || hasEditedPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-scrim px-4">
      <div className="flex w-full flex-col gap-8 rounded-seller-lg bg-surface-default px-4 pt-8 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <div className="flex h-12 items-start justify-between">
          <h2 className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
            추가 금액
          </h2>
          <button
            aria-label="닫기"
            className="flex size-10 items-center justify-center text-text-secondary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="space-y-6">
          <PriceInput
            completeValue="10,000"
            isComplete={isComplete}
            label="케이크 디자인"
            onValueChange={() => setHasEditedPrice(true)}
            value="12,000"
          />
          <PriceInput
            completeValue="3,000"
            isComplete={isComplete}
            label="기타 추가비용"
            onValueChange={() => setHasEditedPrice(true)}
            value="10,000"
          />
          <div className="h-px bg-surface-subtle opacity-90" />
        </div>
        <button
          className={cn(
            "h-[52px] rounded-seller-md text-[18px] leading-6 font-semibold tracking-[-0.54px]",
            isComplete
              ? "bg-brand-primary text-text-inverse"
              : "bg-brand-disabled text-text-disabled",
          )}
          disabled={!isComplete}
          onClick={onConfirm}
          type="button"
        >
          확인
        </button>
      </div>
    </div>
  );
}

function PriceInput({
  completeValue,
  isComplete,
  label,
  onValueChange,
  value,
}: {
  completeValue: string;
  isComplete: boolean;
  label: string;
  onValueChange: () => void;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
        <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
          *
        </span>
      </span>
      <span className="flex h-11 items-start gap-2">
        <input
          className={cn(
            "h-11 min-w-0 flex-1 border-b border-border-default px-4 py-1 outline-none",
            isComplete
              ? "text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary"
              : "text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-disabled",
          )}
          defaultValue={isComplete ? completeValue : value}
          inputMode="numeric"
          onChange={onValueChange}
        />
        <span className="flex h-11 w-4 items-center text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          원
        </span>
      </span>
    </label>
  );
}

function PaymentRequestModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-scrim px-8">
      <div className="flex w-full flex-col items-center gap-6 rounded-seller-lg bg-surface-default py-8">
        <div className="w-full space-y-1 text-center">
          <h2 className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
            결제 요청을 진행하시겠어요?
          </h2>
          <p className="text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
            결제를 요청하시면 주문확인서가 확정됩니다
          </p>
        </div>
        <div className="flex w-full gap-2 px-4">
          <button
            className="h-11 flex-1 rounded-seller-md border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 flex-1 rounded-seller-md bg-brand-primary text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse"
            onClick={onConfirm}
            type="button"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

function buildMessages(
  inquiry: InquiryDetail,
  state: InquiryScreenState,
): InquiryChatMessage[] {
  const paymentRequest: InquiryChatMessage = {
    amount: inquiry.order.totalPrice,
    id: "m-004",
    kind: "payment-request",
    owner: "seller",
    sentAt: "오후 6:20분",
  };
  const paymentComplete: InquiryChatMessage = {
    amount: inquiry.order.totalPrice,
    id: "m-005",
    kind: "payment-complete",
    owner: "buyer",
    sentAt: "오후 6:20분",
  };
  const sellerThanks: InquiryChatMessage = {
    id: "m-006",
    kind: "text",
    owner: "seller",
    sentAt: "오후 6:20분",
    text: "안녕하세요.\n동후님 입금 감사합니다!\n예쁘게 케이크 잘 준비해 놓을게요! 추가로 공지사항만 재확인 부탁드리겠습니다!!",
    unreadCount: 1,
  };
  const buyerThanks: InquiryChatMessage = {
    id: "m-007",
    kind: "text",
    owner: "buyer",
    sentAt: "오후 6:20분",
    text: "감사합니다! 19일에 뵙겠습니다!!",
  };

  if (state === "payment-completed") {
    return [
      ...inquiry.messages,
      paymentRequest,
      paymentComplete,
      {
        id: "m-005-notice",
        kind: "notice",
        text: "8월 14일 오후 6:40분 결제가 완료되었습니다.",
      },
      sellerThanks,
      buyerThanks,
    ];
  }

  if (state === "payment-requested") {
    return [...inquiry.messages, paymentRequest];
  }

  return inquiry.messages;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function setState(
  router: ReturnType<typeof useRouter>,
  inquiryId: string,
  state: InquiryScreenState,
) {
  router.push(`/seller/inquiries/${inquiryId}?state=${state}`);
}
