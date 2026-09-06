"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, Menu, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SellerScreenShell } from "@/features/seller-shell/ui/seller-screen-shell";
import { useSellerHomeDashboardQuery } from "@/features/seller-home/model/seller-home-queries";
import type {
  SellerHomeDashboard,
  SellerHomeInquiry,
  SellerHomeOrderForm,
  SellerHomePickup,
} from "@/features/seller-home/model/seller-home-types";
import { cn } from "@/lib/utils";

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;

type SellerHomeTab = "pickup" | "waiting";
type SellerHomeView =
  "home" | "confirmation" | "chat" | "order-form" | "revision-chat";

export function SellerHomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardQuery = useSellerHomeDashboardQuery();

  const view = (searchParams.get("view") ?? "home") as SellerHomeView;
  const tab = (searchParams.get("tab") ?? "pickup") as SellerHomeTab;
  const pickupId = searchParams.get("pickupId");
  const inquiryState = searchParams.get("inquiryState");
  const showSidebar = searchParams.get("sidebar") === "open";
  const showRevisionModal = searchParams.get("modal") === "revision";
  const dashboard = dashboardQuery.data;

  const setState = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const query = params.toString();
    router.push(query ? `/seller/home?${query}` : "/seller/home");
  };

  if (dashboardQuery.isLoading || !dashboard) {
    return (
      <SellerScreenShell>
        <div className="flex h-dvh items-center justify-center text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-secondary">
          판매자 홈을 불러오는 중
        </div>
      </SellerScreenShell>
    );
  }

  if (view === "confirmation") {
    return (
      <ConfirmationView
        dashboard={dashboard}
        onBack={() => setState({ view: null })}
      />
    );
  }

  if (view === "chat" || view === "revision-chat") {
    return (
      <>
        <ChatView
          dashboard={dashboard}
          mode={view === "revision-chat" ? "revision" : "default"}
          onBack={() => setState({ view: null })}
          onMenu={() => setState({ sidebar: "open" })}
        />
        {showSidebar ? (
          <SellerSidebar onClose={() => setState({ sidebar: null })} />
        ) : null}
      </>
    );
  }

  if (view === "order-form") {
    return (
      <>
        <OrderFormView
          orderForm={dashboard.orderForm}
          onBack={() => setState({ view: null })}
          onRevision={() => setState({ modal: "revision" })}
        />
        {showRevisionModal ? (
          <RevisionModal
            onCancel={() => setState({ modal: null })}
            onContinue={() => setState({ modal: null, view: "revision-chat" })}
          />
        ) : null}
      </>
    );
  }

  return (
    <SellerScreenShell className="relative overflow-x-hidden">
      <HomeHeader onMenu={() => setState({ sidebar: "open" })} />
      <section className="flex flex-col items-center gap-12 overflow-hidden pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <DashboardOverview dashboard={dashboard} />
        <div className="flex w-full flex-col gap-6">
          <div className="h-2 w-full bg-surface-subtle opacity-90" />
          <div
            className="flex w-full gap-2 px-4 pt-4 pb-2"
            data-qa="seller-home-tabs"
          >
            <TabButton
              active={tab === "pickup"}
              onClick={() =>
                setState({ tab: "pickup", pickupId: null, inquiryState: null })
              }
            >
              오늘 픽업
            </TabButton>
            <TabButton
              active={tab === "waiting"}
              onClick={() =>
                setState({
                  tab: "waiting",
                  pickupId: null,
                  inquiryState: null,
                })
              }
            >
              상담 대기
            </TabButton>
          </div>
          {tab === "pickup" ? (
            <PickupList
              pickupId={pickupId}
              pickups={dashboard.pickups}
              onChat={() => setState({ view: "chat" })}
              onConfirmation={() => setState({ view: "confirmation" })}
              onSelect={(id) => setState({ pickupId: id })}
            />
          ) : (
            <InquiryList
              inquiries={dashboard.inquiries}
              selectedState={inquiryState}
              onChat={() => setState({ view: "chat" })}
              onOrderForm={() => setState({ view: "order-form" })}
              onSelect={(state) => setState({ inquiryState: state })}
            />
          )}
        </div>
      </section>
      {showRevisionModal ? (
        <RevisionModal
          onCancel={() => setState({ modal: null })}
          onContinue={() => setState({ modal: null, view: "revision-chat" })}
        />
      ) : null}
      {showSidebar ? (
        <SellerSidebar onClose={() => setState({ sidebar: null })} />
      ) : null}
    </SellerScreenShell>
  );
}

function HomeHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-14 w-full items-center justify-between overflow-hidden bg-surface-default pl-4">
      <div className="flex w-12 items-center pr-2">
        <Image
          alt="wihada"
          className="size-8"
          height={32}
          priority
          src="/seller-home/wihada-symbol.svg"
          width={32}
        />
      </div>
      <div className="flex items-center justify-end px-1">
        <IconButton className="size-11" label="알림">
          <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </IconButton>
        <IconButton className="size-11" label="메뉴" onClick={onMenu}>
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </IconButton>
      </div>
    </header>
  );
}

function DetailHeader({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <header className="flex h-14 w-full items-center justify-between overflow-hidden bg-surface-default">
      <div className="flex min-w-0 flex-1 items-center">
        <IconButton className="size-11" label="뒤로 가기" onClick={onBack}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </IconButton>
      </div>
      <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        {title}
      </h1>
      <div className="h-12 min-w-0 flex-1" />
    </header>
  );
}

function DashboardOverview({ dashboard }: { dashboard: SellerHomeDashboard }) {
  return (
    <div
      className="flex w-full flex-col items-center gap-8"
      data-qa="seller-home-overview"
    >
      <div className="flex h-6 w-full items-center justify-center gap-4 overflow-hidden">
        <IconButton className="size-12 text-icon-muted" label="이전 날짜">
          <ChevronLeft aria-hidden="true" className="size-5" />
        </IconButton>
        <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {dashboard.dateLabel}
        </h2>
        <IconButton className="size-12 text-icon-muted" label="다음 날짜">
          <ChevronRight aria-hidden="true" className="size-5" />
        </IconButton>
      </div>
      <div className="flex h-[79.14px] w-full flex-col gap-1 px-4">
        <div className="grid h-6 grid-cols-7 gap-2">
          {dashboard.weekDays.map((day, index) => (
            <div
              className={cn(
                "flex items-center justify-center rounded-full text-[13px] leading-4 font-medium tracking-[-0.13px]",
                index === 0 ? "text-text-error" : "text-text-secondary",
              )}
              key={day}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dashboard.dateCells.map((cell) => (
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-seller-sm text-[15px] leading-[22px] font-semibold tracking-[-0.15px]",
                cell.selected && "bg-surface-inverse text-text-inverse",
                cell.disabled && !cell.selected && "text-text-unavailable",
                !cell.disabled && !cell.selected && "text-text-primary",
              )}
              key={cell.label}
            >
              {cell.label}
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[86px] w-[calc(100%-32px)] items-center justify-center rounded-seller-sm bg-surface-subtle p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <SummaryCount label="오늘 픽업" value={dashboard.todayPickupCount} />
        <div className="mx-1 h-[54px] w-px bg-surface-default opacity-90" />
        <SummaryCount label="상담 대기" value={dashboard.waitingInquiryCount} />
      </div>
    </div>
  );
}

function SummaryCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <p className="w-full text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p className="flex items-center justify-center gap-2">
        <span className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
          {value}
        </span>
        <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
          건
        </span>
      </p>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-11 w-[87px] items-center justify-center rounded-seller-sm px-4 py-2 text-[15px] leading-5 font-semibold tracking-[-0.3px]",
        active
          ? "bg-surface-inverse text-text-inverse"
          : "bg-surface-subtle text-text-secondary",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PickupList({
  onChat,
  onConfirmation,
  onSelect,
  pickupId,
  pickups,
}: {
  onChat: () => void;
  onConfirmation: () => void;
  onSelect: (id: string) => void;
  pickupId: string | null;
  pickups: SellerHomePickup[];
}) {
  return (
    <div className="flex w-full flex-col gap-2" data-qa="pickup-list">
      {pickups.map((pickup) => {
        const selected = pickupId === pickup.id;
        return (
          <PickupRow
            key={pickup.id}
            onChat={onChat}
            onConfirmation={onConfirmation}
            onSelect={() => onSelect(pickup.id)}
            pickup={pickup}
            selected={selected}
            showActions={selected}
          />
        );
      })}
    </div>
  );
}

function PickupRow({
  onChat,
  onConfirmation,
  onSelect,
  pickup,
  selected,
  showActions,
}: {
  onChat: () => void;
  onConfirmation: () => void;
  onSelect: () => void;
  pickup: SellerHomePickup;
  selected: boolean;
  showActions: boolean;
}) {
  return (
    <article
      className={cn(
        "flex w-full flex-col gap-4 p-4",
        (selected || showActions) && "bg-surface-subtle",
      )}
      data-qa="pickup-row"
    >
      <button
        className="flex h-[70px] w-full items-center gap-4 text-left"
        onClick={onSelect}
        type="button"
      >
        <Image
          alt=""
          className="size-[70px] shrink-0 rounded-seller-sm object-cover"
          height={70}
          src={pickup.imageUrl}
          width={70}
        />
        <div className="flex h-full min-w-0 flex-1 flex-col items-start justify-between whitespace-nowrap">
          <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
            {pickup.pickupTime}
          </p>
          <p className="w-full overflow-hidden text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-ellipsis text-text-tertiary">
            8월 19일 · {pickup.customerMaskedName}
          </p>
          <p className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary">
            {formatWon(pickup.totalPrice)}
          </p>
        </div>
      </button>
      {showActions ? (
        <div className="flex gap-2">
          <Button
            className="h-11 flex-1 rounded-seller-md border-border-default text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            onClick={onChat}
            variant="outline"
          >
            채팅방 가기
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            onClick={onConfirmation}
          >
            주문확인서
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function InquiryList({
  inquiries,
  onChat,
  onOrderForm,
  onSelect,
  selectedState,
}: {
  inquiries: SellerHomeInquiry[];
  onChat: () => void;
  onOrderForm: () => void;
  onSelect: (state: string) => void;
  selectedState: string | null;
}) {
  return (
    <div className="flex w-full flex-col gap-2" data-qa="inquiry-list">
      {inquiries.map((inquiry) => {
        const state = inquiry.hasOrderForm ? "with-order" : "without-order";
        const selected = selectedState === state;
        return (
          <InquiryRow
            inquiry={inquiry}
            key={inquiry.id}
            onChat={onChat}
            onOrderForm={onOrderForm}
            onSelect={() => onSelect(state)}
            selected={selected}
          />
        );
      })}
    </div>
  );
}

function InquiryRow({
  inquiry,
  onChat,
  onOrderForm,
  onSelect,
  selected,
}: {
  inquiry: SellerHomeInquiry;
  onChat: () => void;
  onOrderForm: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "flex w-full flex-col gap-4 p-4",
        selected && "bg-surface-subtle",
      )}
      data-qa="inquiry-row"
    >
      <button
        className="flex h-[70px] w-full items-center gap-4 text-left"
        onClick={onSelect}
        type="button"
      >
        <StoreAvatar />
        <div className="flex h-full min-w-0 flex-1 items-center justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex w-full items-center gap-1">
              <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
                {inquiry.customerMaskedName}
              </p>
              <span className="flex size-4 items-center justify-center rounded-full bg-brand-destructive px-[3px] text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-inverse">
                {inquiry.unreadCount}
              </span>
            </div>
            <p className="w-full overflow-hidden text-[16px] leading-6 font-normal tracking-[-0.32px] text-ellipsis whitespace-nowrap text-text-secondary">
              {inquiry.previewMessage}
            </p>
          </div>
          <time className="h-full w-11 shrink-0 text-right text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
            {inquiry.sentAt}
          </time>
        </div>
      </button>
      {selected ? (
        <div className="flex gap-2">
          <Button
            className="h-11 flex-1 rounded-seller-md border-border-default text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            onClick={onChat}
            variant="outline"
          >
            채팅방 가기
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px] disabled:bg-[#d0d0d2] disabled:text-text-disabled disabled:opacity-100"
            disabled={!inquiry.hasOrderForm}
            onClick={onOrderForm}
          >
            주문서 보기
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function StoreAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-[70px] shrink-0 items-center justify-center overflow-hidden rounded-seller-sm border border-border-default bg-surface-default",
        className,
      )}
    >
      <Image
        alt=""
        className="size-8 opacity-30 grayscale"
        height={32}
        src="/seller-home/wihada-symbol.svg"
        width={32}
      />
    </div>
  );
}

function ConfirmationView({
  dashboard,
  onBack,
}: {
  dashboard: SellerHomeDashboard;
  onBack: () => void;
}) {
  return (
    <SellerScreenShell className="bg-surface-subtle">
      <DetailHeader onBack={onBack} title="주문확인서" />
      <section className="flex w-full flex-col items-center gap-4 overflow-hidden px-4 pt-6 pb-4">
        <div className="flex w-full flex-col gap-8 rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex w-full items-start justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            <p>8월 17일 수요일</p>
            <p>오후 2:00</p>
          </div>
          <div className="flex flex-col gap-1">
            <InfoLine label="주문자" value={dashboard.orderForm.customerName} />
            <InfoLine
              label="연락처"
              value={dashboard.orderForm.customerPhone}
            />
          </div>
          <div className="h-px w-full bg-surface-subtle opacity-90" />
          <div className="flex flex-col gap-6">
            {[
              ["디자인", "2호 (18cm/높이 7cm)", "+ 45000원 ~"],
              ["모양", "사각", "+ 3000원"],
              ["케이크 맛", "초코시트 + 생크림", "+ 3000원"],
              ["포장 방식", "보닝백 포장", "+ 4000원"],
              ["케이크 디자인", "생화 + 12000원 (싯가 반영)", ""],
              ["기타 요청사항", "잘 부탁드립니다:)", ""],
            ].map(([label, value, price]) => (
              <ConfirmationLine
                key={label}
                label={label}
                price={price}
                value={value}
              />
            ))}
          </div>
          <div className="h-px w-full bg-surface-subtle opacity-90" />
          <div className="flex justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            <p>최종 가격</p>
            <p>58,000원</p>
          </div>
        </div>
        <Button
          className="h-[52px] w-full rounded-seller-md bg-[#d0d0d2] text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-inverse hover:bg-[#d0d0d2]"
          disabled
        >
          결제 완료
        </Button>
      </section>
    </SellerScreenShell>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <dt className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </dt>
      <dd className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {value}
      </dd>
    </div>
  );
}

function ConfirmationLine({
  label,
  price,
  value,
}: {
  label: string;
  price?: string;
  value: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <div className="flex w-full items-center justify-between gap-3">
        <p className="min-w-0 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {value}
        </p>
        {price ? (
          <p className="shrink-0 text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary">
            {price}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function OrderFormView({
  onBack,
  onRevision,
  orderForm,
}: {
  onBack: () => void;
  onRevision: () => void;
  orderForm: SellerHomeOrderForm;
}) {
  return (
    <SellerScreenShell className="bg-surface-subtle">
      <DetailHeader onBack={onBack} title="주문서" />
      <section className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pt-4 pb-[calc(94px+env(safe-area-inset-bottom))]">
        <div className="flex w-full flex-col gap-12 rounded-seller-sm bg-surface-default px-4 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
          <OrderFormSection
            label="픽업 일시"
            value={orderForm.pickupDateLabel}
            priceLabel={orderForm.pickupTimeLabel}
          />
          {orderForm.items.map((item) => (
            <OrderFormSection
              key={item.id}
              label={item.label}
              priceLabel={item.priceLabel}
              required={item.required}
              value={item.value}
            />
          ))}
        </div>
      </section>
      <div className="fixed right-0 bottom-0 left-0 mx-auto flex w-full gap-2 bg-surface-default px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] lg:max-w-[390px]">
        <Button
          className="h-11 flex-1 rounded-seller-md border-border-strong text-[15px] leading-5 font-semibold tracking-[-0.3px]"
          onClick={onRevision}
          variant="outline"
        >
          수정 요청
        </Button>
        <Button className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]">
          주문확인서 작성
        </Button>
      </div>
    </SellerScreenShell>
  );
}

function OrderFormSection({
  label,
  priceLabel,
  required,
  value,
}: {
  label: string;
  priceLabel?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="flex items-start text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {required ? (
          <span className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
        {label}
      </h2>
      <div className="flex h-6 w-full items-center justify-between gap-3">
        <div className="flex h-11 min-w-0 items-center">
          <span className="mr-2 size-4 shrink-0 rounded-full border-2 border-border-default" />
          <p className="truncate text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary">
            {value}
          </p>
        </div>
        {priceLabel ? (
          <p
            className={cn(
              "shrink-0 text-right text-[15px] font-semibold",
              label === "픽업 일시"
                ? "w-[194px] leading-5 tracking-[-0.3px] text-text-secondary"
                : "w-[160px] leading-[22px] tracking-[-0.15px] text-text-primary",
            )}
          >
            {priceLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ChatView({
  dashboard,
  mode,
  onBack,
  onMenu,
}: {
  dashboard: SellerHomeDashboard;
  mode: "default" | "revision";
  onBack: () => void;
  onMenu: () => void;
}) {
  const isRevision = mode === "revision";

  return (
    <SellerScreenShell className="bg-surface-subtle">
      <header className="sticky top-0 z-10 bg-surface-default">
        <div className="flex h-14 w-full items-center justify-between overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center">
            <IconButton className="size-11" label="뒤로 가기" onClick={onBack}>
              <ChevronLeft aria-hidden="true" className="size-5" />
            </IconButton>
          </div>
          <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            {dashboard.chat.storeName}
          </h1>
          <div className="flex min-w-0 flex-1 items-center justify-end px-1">
            <IconButton className="size-11" label="메뉴" onClick={onMenu}>
              <Menu aria-hidden="true" className="size-5" />
            </IconButton>
          </div>
        </div>
        <div className="flex w-full items-center justify-between px-4 py-2">
          <p className="text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
            {dashboard.chat.info}
          </p>
          <span className="rounded-seller-sm bg-surface-subtle px-2 py-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
            {dashboard.chat.statusLabel}
          </span>
        </div>
      </header>
      <section className="flex flex-col gap-8 pb-6" data-qa="chat-view">
        <DatePill>{dashboard.chat.dateLabel}</DatePill>
        <IncomingOrderBubble />
        <SystemNotice>8월 14일 16:40분 주문이 접수되었습니다.</SystemNotice>
        {isRevision ? (
          <OutgoingCard
            caption="수정 요청"
            cta="주문서 수정하기"
            helper="주문서 수정을 요청했어요"
            title="주문서를 수정해주세요"
          />
        ) : (
          <>
            <OutgoingMessage>
              안녕하세요. 주문 감사합니다! ☺️
              <br />
              케이크 레터링 색감은 원하시는 색 사진 넣어주시면 최대한 비슷하게
              만들어 주고 있습니다!
              <br />
              <br />
              금액은 전체 생화 포함 64,000원입니다! 주문 확인 후 수정사항 없으면
              결제 부탁드리겠습니다!
            </OutgoingMessage>
            <OutgoingCard
              caption="결제 요청"
              cta="주문확인서 보기"
              helper="주문서를 확인해보세요"
              price="64,000원"
              title="최종 가격"
            />
            <IncomingPaidBubble />
            <SystemNotice>
              8월 14일 오후 6:40분 결제가 완료되었습니다.
            </SystemNotice>
            <OutgoingMessage>
              안녕하세요.
              <br />
              동후님 입금 감사합니다!
              <br />
              예쁘게 케이크 잘 준비해 놓을게요! 추가로 공지사항만 재확인
              부탁드리겠습니다!!😊
            </OutgoingMessage>
            <IncomingMessage>감사합니다! 19일에 뵙겠습니다!!</IncomingMessage>
          </>
        )}
      </section>
      <ChatComposer />
    </SellerScreenShell>
  );
}

function DatePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center pt-4 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
      {children}
    </div>
  );
}

function SystemNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center px-2">
      <p className="rounded-seller-lg bg-surface-default px-4 py-2 text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
        {children}
      </p>
    </div>
  );
}

function IncomingOrderBubble() {
  return (
    <div className="flex w-full items-end gap-1 pr-12 pl-2">
      <StoreAvatar className="size-10" />
      <div className="flex shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
        <Image
          alt=""
          className="size-[208px] rounded-seller-sm object-cover"
          height={208}
          src="/seller-home/chat-cake-flower.png"
          width={208}
        />
        <div className="flex flex-col gap-1">
          <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
            케이크 2호 사이즈
          </p>
          <p className="w-[185px] text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
            원형 / 바닐라시트 + 생크림
          </p>
        </div>
        <div className="flex w-[208px] flex-col">
          <SmallBubbleButton>주문서 보기</SmallBubbleButton>
          <SmallBubbleButton disabled>주문확인서 작성</SmallBubbleButton>
        </div>
      </div>
      <time className="text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap text-text-tertiary">
        오후 6:20분
      </time>
    </div>
  );
}

function IncomingPaidBubble() {
  return (
    <div className="flex w-full items-end gap-1 pr-12 pl-2">
      <StoreAvatar className="size-10" />
      <div className="flex shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
        <div className="flex w-[208px] flex-col gap-2">
          <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
            결제 완료
          </p>
          <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            64,000원을 보냈어요.
          </p>
          <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
            포싵 사장님께 결제금액을 보냈어요
          </p>
        </div>
        <SmallBubbleButton>주문내역 보기</SmallBubbleButton>
      </div>
      <time className="text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap text-text-tertiary">
        오후 6:20분
      </time>
    </div>
  );
}

function IncomingMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-end gap-1 pr-12 pl-2">
      <StoreAvatar className="size-10" />
      <p className="max-w-[232px] rounded-seller-lg bg-surface-default px-4 py-2 text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary">
        {children}
      </p>
      <time className="text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap text-text-tertiary">
        오후 6:20분
      </time>
    </div>
  );
}

function OutgoingMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-end justify-end gap-1 pr-2 pl-12">
      <time className="flex flex-col items-end text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap">
        <span className="text-text-primary">1</span>
        <span className="text-text-tertiary">오후 6:20분</span>
      </time>
      <p className="max-w-[232px] rounded-seller-lg bg-surface-inverse px-4 py-2 text-[16px] leading-6 font-normal tracking-[-0.32px] whitespace-pre-wrap text-text-inverse">
        {children}
      </p>
    </div>
  );
}

function OutgoingCard({
  caption,
  cta,
  helper,
  price,
  title,
}: {
  caption: string;
  cta: string;
  helper: string;
  price?: string;
  title: string;
}) {
  return (
    <div className="flex w-full items-end justify-end gap-1 pr-2 pl-12">
      <time className="flex flex-col items-end text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap">
        <span className="text-text-primary">1</span>
        <span className="text-text-tertiary">오후 6:20분</span>
      </time>
      <div className="flex shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
        <div className="flex w-[208px] flex-col gap-2">
          <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
            {caption}
          </p>
          <div className="flex items-center justify-between gap-3 text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            <p>{title}</p>
            {price ? <p>{price}</p> : null}
          </div>
          <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-[#8a8b8d]">
            {helper}
          </p>
        </div>
        <SmallBubbleButton>{cta}</SmallBubbleButton>
      </div>
    </div>
  );
}

function SmallBubbleButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-[208px] items-center justify-center rounded-seller-lg border text-[15px] leading-5 font-semibold tracking-[-0.3px]",
        disabled
          ? "border-transparent bg-[#d0d0d2] text-text-disabled"
          : "border-border-default bg-surface-default text-text-primary",
      )}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

function ChatComposer() {
  return (
    <div className="flex w-full flex-col items-center bg-surface-elevated px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] shadow-[0_-12px_12px_rgba(0,0,0,0.04)]">
      <div className="flex h-[52px] w-full items-center gap-2 rounded-seller-lg border border-border-default bg-surface-subtle p-2">
        <button
          aria-label="첨부 추가"
          className="flex aspect-square h-full items-center justify-center rounded-full bg-surface-default"
          type="button"
        >
          <Plus aria-hidden="true" className="size-6 text-icon-muted" />
        </button>
        <span className="flex-1 text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-unavailable">
          메시지 입력
        </span>
      </div>
    </div>
  );
}

function RevisionModal({
  onCancel,
  onContinue,
}: {
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-30 flex items-center justify-center bg-surface-scrim px-8"
      role="dialog"
    >
      <div className="flex w-full flex-col items-center gap-6 rounded-seller-lg bg-surface-default py-8">
        <div className="flex w-full flex-col items-center justify-center gap-1">
          <h2 className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
            수정 요청을 진행하시겠어요?
          </h2>
          <p className="w-full text-center text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
            취소요청을 진행하시면 고객님께서 주문서를
            <br />
            새로 작성해야
          </p>
        </div>
        <div className="flex w-full gap-2 px-4">
          <Button
            className="h-11 flex-1 rounded-seller-md border-border-default text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            onClick={onCancel}
            variant="outline"
          >
            취소
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            onClick={onContinue}
          >
            계속하기
          </Button>
        </div>
      </div>
    </div>
  );
}

function SellerSidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-end bg-surface-scrim">
      <aside className="flex h-dvh w-[300px] flex-col gap-6 overflow-hidden bg-surface-elevated py-[41px]">
        <div className="flex w-full items-center justify-between px-6">
          <Image
            alt="wihada"
            height={20}
            src="/brand/wihada-logo.svg"
            width={87}
          />
          <IconButton className="size-10" label="닫기" onClick={onClose}>
            <X aria-hidden="true" className="size-5" />
          </IconButton>
        </div>
        <div className="h-px w-full bg-brand-subtle" />
        <nav className="flex min-h-0 flex-1 flex-col gap-8 py-6">
          <SidebarGroup items={["홈", "스토어 관리"]} title="스토어" />
          <SidebarGroup
            items={["내 상담", "주문 내역", "주문 캘린더"]}
            title="주문"
          />
          <SidebarGroup items={["매출분석"]} title="정산" />
          <SidebarGroup items={["계정 설정"]} title="계정" />
        </nav>
        <div className="px-6">
          <Button className="h-[52px] w-full rounded-seller-md text-[18px] leading-6 font-semibold tracking-[-0.54px]">
            내 스토어 보기
          </Button>
        </div>
      </aside>
    </div>
  );
}

const sidebarRoutes: Record<string, string> = {
  "계정 설정": "/seller/account-settings",
  매출분석: "/seller/revenue",
  "내 상담": "/seller/inquiries",
  "스토어 관리": "/seller/store-management",
  "주문 내역": "/seller/orders",
  "주문 캘린더": "/seller/orders/calendar",
  홈: "/seller/home",
};

function SidebarGroup({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="px-6 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
        {title}
      </p>
      {items.map((item, index) => (
        <div key={item}>
          <Link
            className="flex h-6 items-center px-6 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary"
            href={sidebarRoutes[item] ?? "/seller/home"}
          >
            {item}
          </Link>
          {index < items.length - 1 ? (
            <div className="mx-6 mt-4 h-px bg-surface-subtle opacity-90" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
