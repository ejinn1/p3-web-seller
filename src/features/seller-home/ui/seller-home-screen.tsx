"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/common/button";
import { Header } from "@/components/common/header";
import { IconButton } from "@/components/common/icon-button";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import { getInquiryDetailHref } from "@/features/inquiries/model/inquiry-detail-state";
import { useSellerInquiryListStomp } from "@/features/inquiries/model/inquiry-list-stomp";
import { useSellerOrdersQuery } from "@/features/orders/model/order-queries";
import type {
  SellerOrderListItem,
  SellerOrderStatus,
} from "@/features/orders/model/order-types";
import { useSellerHomeDashboardQuery } from "@/features/seller-home/model/seller-home-queries";
import type {
  SellerHomeDashboard,
  SellerHomeInquiry,
  SellerHomeOrderForm,
  SellerHomePickup,
} from "@/features/seller-home/model/seller-home-types";
import { cn } from "@/lib/utils";

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;
const pickupImageFallbacks = [
  "/seller-home/cake-flower.png",
  "/seller-home/cake-berries.png",
  "/seller-home/cake-box.png",
];

type SellerHomeTab = "pickup" | "waiting";
type SellerHomeView =
  "home" | "confirmation" | "chat" | "order-form" | "revision-chat";

export function SellerHomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardQuery = useSellerHomeDashboardQuery();
  const currentUserQuery = useCurrentUserQuery(!useFixtures);
  useSellerInquiryListStomp(currentUserQuery.data?.userId, !useFixtures);

  const view = (searchParams.get("view") ?? "home") as SellerHomeView;
  const tab = (searchParams.get("tab") ?? "pickup") as SellerHomeTab;
  const pickupId = searchParams.get("pickupId");
  const inquiryId = searchParams.get("inquiryId");
  const showSidebar = searchParams.get("sidebar") === "open";
  const showRevisionModal = searchParams.get("modal") === "revision";
  const dashboard = dashboardQuery.data;
  const selectedDate = resolveSelectedDate(
    searchParams.get("date"),
    dashboard?.dateCells ?? [],
  );
  const selectedPickupOrdersQuery = useSellerOrdersQuery(
    {
      dateBasis: "PICKUP_AT",
      endDate: selectedDate,
      startDate: selectedDate,
    },
    Boolean(!useFixtures && selectedDate && tab === "pickup"),
  );

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

  if (dashboardQuery.isError) {
    return (
      <SellerResponsiveFrame>
        <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-seller-body-md text-text-secondary">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : "판매자 홈을 불러오지 못했습니다."}
          </p>
          <Button onClick={() => void dashboardQuery.refetch()} size="md">
            다시 시도
          </Button>
        </div>
      </SellerResponsiveFrame>
    );
  }

  if (dashboardQuery.isLoading || !dashboard) {
    return (
      <SellerResponsiveFrame>
        <div className="flex h-dvh items-center justify-center text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-secondary">
          판매자 홈을 불러오는 중
        </div>
      </SellerResponsiveFrame>
    );
  }

  const selectedDateLabel = formatHomeDate(selectedDate);
  const selectedPickups = useFixtures
    ? dashboard.pickups.filter((pickup) => pickup.pickupDate === selectedDate)
    : (selectedPickupOrdersQuery.data ?? []).map(toSellerHomePickup);
  const selectedPickupCount = useFixtures
    ? selectedPickups.length
    : (selectedPickupOrdersQuery.data?.length ??
      (isDefaultSelectedDate(selectedDate, dashboard.dateCells)
        ? dashboard.todayPickupCount
        : 0));

  if (view === "confirmation") {
    return (
      <>
        <ConfirmationView
          dashboard={dashboard}
          onBack={() => setState({ view: null })}
          onMenu={() => setState({ sidebar: "open" })}
        />
        <SellerSidebar
          onOpenChange={(open) => setState({ sidebar: open ? "open" : null })}
          open={showSidebar}
        />
      </>
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
        <SellerSidebar
          onOpenChange={(open) => setState({ sidebar: open ? "open" : null })}
          open={showSidebar}
        />
      </>
    );
  }

  if (view === "order-form") {
    return (
      <>
        <OrderFormView
          onMenu={() => setState({ sidebar: "open" })}
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
        <SellerSidebar
          onOpenChange={(open) => setState({ sidebar: open ? "open" : null })}
          open={showSidebar}
        />
      </>
    );
  }

  return (
    <SellerResponsiveFrame className="relative overflow-x-hidden">
      <HomeHeader onMenu={() => setState({ sidebar: "open" })} />
      <section className="flex flex-col items-center gap-12 overflow-hidden pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <DashboardOverview
          dashboard={dashboard}
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedPickupCount={selectedPickupCount}
          onMoveDate={(date) =>
            setState({ date, inquiryId: null, pickupId: null })
          }
          onSelectDate={(date) =>
            setState({ date, inquiryId: null, pickupId: null })
          }
        />
        <div className="flex w-full flex-col gap-6">
          <div className="h-2 w-full bg-surface-subtle opacity-90" />
          <div
            className="flex w-full gap-2 px-4 pt-4 pb-2"
            data-qa="seller-home-tabs"
          >
            <TabButton
              active={tab === "pickup"}
              onClick={() =>
                setState({
                  tab: "pickup",
                  pickupId: null,
                  inquiryId: null,
                  inquiryState: null,
                })
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
                  inquiryId: null,
                  inquiryState: null,
                })
              }
            >
              문의대기
            </TabButton>
          </div>
          {tab === "pickup" ? (
            <PickupList
              pickupId={pickupId}
              pickups={selectedPickups}
              isError={selectedPickupOrdersQuery.isError}
              isLoading={selectedPickupOrdersQuery.isLoading}
              onChat={() => setState({ view: "chat" })}
              onConfirmation={() => setState({ view: "confirmation" })}
              onSelect={(id) => setState({ pickupId: id })}
            />
          ) : (
            <InquiryList
              inquiries={dashboard.inquiries}
              selectedInquiryId={inquiryId}
              onChat={(selectedInquiryId) =>
                router.push(getInquiryDetailHref(selectedInquiryId, "chat"))
              }
              onOrderForm={() => setState({ view: "order-form" })}
              onSelect={(selectedInquiryId) =>
                setState({ inquiryId: selectedInquiryId, inquiryState: null })
              }
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
      <SellerSidebar
        onOpenChange={(open) => setState({ sidebar: open ? "open" : null })}
        open={showSidebar}
      />
    </SellerResponsiveFrame>
  );
}

function HomeHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <Header
      className="w-full border-none pl-4"
      leading={
        <Image
          alt="wihada"
          className="size-8"
          height={32}
          priority
          src="/seller-home/wihada-symbol.svg"
          width={32}
        />
      }
      onMenu={onMenu}
      showMenu
      showNotification
    />
  );
}

function DetailHeader({
  onBack,
  onMenu,
  title,
}: {
  onBack: () => void;
  onMenu: () => void;
  title: string;
}) {
  return (
    <Header
      className="w-full border-none"
      onBack={onBack}
      onMenu={onMenu}
      showMenu
      title={title}
    />
  );
}

function DashboardOverview({
  dashboard,
  onMoveDate,
  onSelectDate,
  selectedDate,
  selectedDateLabel,
  selectedPickupCount,
}: {
  dashboard: SellerHomeDashboard;
  onMoveDate: (date: string) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  selectedDateLabel: string;
  selectedPickupCount: number;
}) {
  const selectedDateIndex = dashboard.dateCells.findIndex(
    (cell) => cell.date === selectedDate,
  );
  const previousDate =
    selectedDateIndex > 0 ? dashboard.dateCells[selectedDateIndex - 1] : null;
  const nextDate =
    selectedDateIndex >= 0 && selectedDateIndex < dashboard.dateCells.length - 1
      ? dashboard.dateCells[selectedDateIndex + 1]
      : null;

  return (
    <div
      className="flex w-full flex-col items-center gap-8"
      data-qa="seller-home-overview"
    >
      <div className="flex h-6 w-full items-center justify-center gap-4 overflow-hidden">
        <IconButton
          className="size-12 text-icon-muted"
          disabled={!previousDate || previousDate.disabled}
          label="이전 날짜"
          onClick={() => previousDate && onMoveDate(previousDate.date)}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </IconButton>
        <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {selectedDateLabel}
        </h2>
        <IconButton
          className="size-12 text-icon-muted"
          disabled={!nextDate || nextDate.disabled}
          label="다음 날짜"
          onClick={() => nextDate && onMoveDate(nextDate.date)}
        >
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
            <button
              aria-pressed={cell.date === selectedDate}
              className={cn(
                "flex aspect-square items-center justify-center rounded-seller-sm text-[15px] leading-[22px] font-semibold tracking-[-0.15px]",
                cell.date === selectedDate && "bg-surface-inverse text-text-inverse",
                cell.disabled &&
                  cell.date !== selectedDate &&
                  "text-text-unavailable",
                !cell.disabled &&
                  cell.date !== selectedDate &&
                  "text-text-primary",
              )}
              disabled={cell.disabled}
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              type="button"
            >
              {cell.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-[86px] w-[calc(100%-32px)] items-center justify-center rounded-seller-sm bg-surface-subtle p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <SummaryCount label="오늘 픽업" value={selectedPickupCount} />
        <div className="mx-1 h-[54px] w-px bg-surface-default opacity-90" />
        <SummaryCount label="문의대기" value={dashboard.waitingInquiryCount} />
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
  isError,
  isLoading,
  onChat,
  onConfirmation,
  onSelect,
  pickupId,
  pickups,
}: {
  isError: boolean;
  isLoading: boolean;
  onChat: () => void;
  onConfirmation: () => void;
  onSelect: (id: string) => void;
  pickupId: string | null;
  pickups: SellerHomePickup[];
}) {
  if (isLoading) {
    return (
      <p className="px-4 py-8 text-center text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary">
        선택한 날짜의 픽업을 불러오는 중입니다.
      </p>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-8 text-center text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-error">
        선택한 날짜의 픽업을 불러오지 못했습니다.
      </p>
    );
  }

  if (pickups.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary">
        선택한 날짜의 픽업이 없습니다.
      </p>
    );
  }

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

function resolveSelectedDate(
  requestedDate: string | null,
  dateCells: SellerHomeDashboard["dateCells"],
) {
  const requestedCell = dateCells.find(
    (cell) => cell.date === requestedDate && !cell.disabled,
  );

  if (requestedCell) {
    return requestedCell.date;
  }

  return (
    dateCells.find((cell) => cell.selected && !cell.disabled)?.date ??
    dateCells.find((cell) => !cell.disabled)?.date ??
    dateCells[0]?.date ??
    requestedDate ??
    ""
  );
}

function formatHomeDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return `${year}년 ${month}월 ${day}일`;
}

function formatPickupDateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return `${month}월 ${day}일`;
}

function isDefaultSelectedDate(
  selectedDate: string,
  dateCells: SellerHomeDashboard["dateCells"],
) {
  return dateCells.some((cell) => cell.selected && cell.date === selectedDate);
}

function toSellerHomePickup(
  order: SellerOrderListItem,
  index: number,
): SellerHomePickup {
  return {
    id: order.id,
    pickupDate: toKoreaIsoDate(order.pickupAt),
    pickupTime: formatPickupTime(order.pickupAt),
    customerName: "고객",
    customerMaskedName: "고객 님",
    totalPrice: order.paidAmount,
    imageUrl: pickupImageFallbacks[index % pickupImageFallbacks.length],
    status: toHomeOrderStatus(order.status),
  };
}

function toHomeOrderStatus(
  status: SellerOrderStatus | null,
): SellerHomePickup["status"] {
  if (status === "PAID") {
    return "PICKUP_READY";
  }

  if (status === "PICKED_UP") {
    return "PAYMENT_COMPLETE";
  }

  return "REVISION_REQUESTED";
}

function formatPickupTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function toKoreaIsoDate(value: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  });

  return formatter.format(new Date(value));
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
            {formatPickupDateLabel(pickup.pickupDate)} · {pickup.customerMaskedName}
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
  selectedInquiryId,
}: {
  inquiries: SellerHomeInquiry[];
  onChat: (inquiryId: string) => void;
  onOrderForm: () => void;
  onSelect: (inquiryId: string) => void;
  selectedInquiryId: string | null;
}) {
  return (
    <div className="flex w-full flex-col gap-2" data-qa="inquiry-list">
      {inquiries.map((inquiry) => {
        const selected = selectedInquiryId === inquiry.id;
        return (
          <InquiryRow
            inquiry={inquiry}
            key={inquiry.id}
            onChat={() => onChat(inquiry.id)}
            onOrderForm={onOrderForm}
            onSelect={() => onSelect(inquiry.id)}
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
  onMenu,
}: {
  dashboard: SellerHomeDashboard;
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <SellerResponsiveFrame className="bg-surface-subtle">
      <DetailHeader onBack={onBack} onMenu={onMenu} title="주문확인서" />
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
    </SellerResponsiveFrame>
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
  onMenu,
  onRevision,
  orderForm,
}: {
  onBack: () => void;
  onMenu: () => void;
  onRevision: () => void;
  orderForm: SellerHomeOrderForm;
}) {
  return (
    <SellerResponsiveFrame className="bg-surface-subtle">
      <DetailHeader onBack={onBack} onMenu={onMenu} title="주문서" />
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
      <div className="fixed right-0 bottom-0 left-0 mx-auto flex w-full gap-2 bg-surface-default px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] max-w-[768px]">
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
    </SellerResponsiveFrame>
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
      <h2 className="flex items-start gap-1 text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {label}
        {required ? (
          <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
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
    <SellerResponsiveFrame className="bg-surface-subtle">
      <header className="sticky top-0 z-10 bg-surface-default">
        <Header
          className="border-none"
          onBack={onBack}
          onMenu={onMenu}
          showMenu
          title={dashboard.chat.storeName}
        />
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
    </SellerResponsiveFrame>
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
