"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { Header } from "@/components/common/header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import {
  longTextSellerOrderFixture,
  nullStatusSellerOrderFixture,
  sellerOrderViewFixtures,
} from "@/features/orders/model/order-fixtures";
import { useSellerOrdersQuery } from "@/features/orders/model/order-queries";
import type {
  SellerOrderListItem,
  SellerOrderStatus,
  SellerOrderViewModel,
} from "@/features/orders/model/order-types";
import { cn } from "@/lib/utils";

type ForcedState =
  "loading" | "empty" | "error" | "long" | "null-status" | null;
type FilterPreset = "1개월" | "3개월" | "6개월" | "직접선택";
type CustomDateStep = "start" | "end" | "done" | null;

const statusLabels: Record<SellerOrderStatus, string> = {
  PAID: "결제완료",
  PICKED_UP: "픽업완료",
  CANCEL_REQUESTED: "취소요청",
  CANCELED: "취소완료",
  REFUND_PROCESSING: "환불처리중",
  REFUNDED: "환불완료",
};

export function SellerOrdersScreen() {
  const searchParams = useSearchParams();
  const forcedState = parseForcedState(searchParams.get("state"));
  const [filterOpen, setFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customStep, setCustomStep] = useState<CustomDateStep>(null);
  const [customDateSelected, setCustomDateSelected] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(
    null,
  );
  const [selectedRange, setSelectedRange] = useState({
    start: "2026.07.11",
    end: "2026.08.11",
  });
  const orderListParams = selectedPreset
    ? {
        dateBasis: "CREATED_AT" as const,
        endDate: toIsoDate(selectedRange.end),
        startDate: toIsoDate(selectedRange.start),
      }
    : {};
  const query = useSellerOrdersQuery(orderListParams, !forcedState);

  const orders = useMemo(
    () => getOrdersForState(forcedState, query.data),
    [forcedState, query.data],
  );
  const groupedOrders = useMemo(
    () => groupOrdersByPaymentDate(orders),
    [orders],
  );
  const isLoading = forcedState === "loading" || query.isLoading;
  const isError = forcedState === "error" || query.isError;

  const activeFilterLabel = selectedPreset
    ? `${selectedRange.start} ~ ${selectedRange.end}`
    : null;

  return (
    <SellerResponsiveFrame className="bg-surface-default">
      <OrdersHeader
        backHref="/seller/home"
        onMenu={() => setSidebarOpen(true)}
        showMenu
        title="주문 내역"
      />
      <section className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <div className="flex h-[60px] items-center gap-2 px-4 pt-4 pb-2">
          <button
            aria-label="조회기간 선택"
            className={cn(
              "flex size-9 items-center justify-center rounded-seller-sm",
              activeFilterLabel
                ? "bg-brand-primary text-text-inverse"
                : "bg-surface-subtle text-icon-default",
            )}
            data-qa="orders-filter-button"
            onClick={() => setFilterOpen(true)}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
          </button>
          {activeFilterLabel ? (
            <span
              className="flex h-9 items-center gap-0 rounded-seller-sm bg-surface-subtle pr-0 pl-4 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary"
              data-qa="orders-active-filter"
            >
              {activeFilterLabel}
              <button
                aria-label="선택한 조회기간 삭제"
                className="-ml-4 flex size-12 items-center justify-center text-icon-default"
                onClick={() => {
                  setSelectedPreset(null);
                  setSelectedRange({ start: "2026.07.11", end: "2026.08.11" });
                }}
                type="button"
              >
                <X aria-hidden="true" className="size-3 translate-x-2" />
              </button>
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <OrdersState message="주문 내역을 불러오고 있어요." />
        ) : null}
        {isError ? (
          <OrdersState
            message={
              query.error instanceof Error
                ? query.error.message
                : "주문 내역을 불러오지 못했습니다."
            }
          />
        ) : null}
        {!isLoading && !isError && groupedOrders.length === 0 ? (
          <OrdersState message="조회기간에 해당하는 주문이 없습니다." />
        ) : null}
        {!isLoading && !isError && groupedOrders.length > 0 ? (
          <div data-qa="orders-list" className="flex flex-col">
            {groupedOrders.map((group, groupIndex) => (
              <section key={group.label}>
                <h2
                  className="h-[46px] px-4 pt-4 pb-2 text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary"
                  data-qa="orders-date-heading"
                >
                  {group.label}
                </h2>
                <div className="flex flex-col gap-2">
                  {group.orders.map((order, orderIndex) => (
                    <OrderListItem
                      highlighted={
                        Boolean(activeFilterLabel) &&
                        groupIndex === 0 &&
                        orderIndex === 0
                      }
                      key={order.id}
                      order={order}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </section>

      <DateFilterSheet
        onClose={() => setFilterOpen(false)}
        onCustom={() => {
          setFilterOpen(false);
          setCustomDateSelected(false);
          setCustomStep("start");
        }}
        onSelect={(preset) => {
          setSelectedPreset(preset);
          setSelectedRange(rangeForPreset(preset));
        }}
        open={filterOpen}
        selectedPreset={selectedPreset}
        selectedRange={selectedRange}
      />

      <CustomDateSheet
        onBack={() => {
          if (customStep === "start") {
            setCustomStep(null);
            setFilterOpen(true);
            return;
          }

          setCustomStep(customStep === "end" ? "start" : "end");
        }}
        onClose={() => setCustomStep(null)}
        onNext={() => {
          if (customStep === "start") {
            setSelectedRange((range) => ({ ...range, start: "2026.08.18" }));
            setCustomDateSelected(false);
            setCustomStep("end");
            return;
          }

          if (customStep === "end") {
            setSelectedRange((range) => ({ ...range, end: "2026.08.18" }));
            setCustomStep("done");
            return;
          }

          setSelectedPreset("직접선택");
          setCustomStep(null);
        }}
        onSelectDate={() => setCustomDateSelected(true)}
        open={customStep !== null}
        selected={customDateSelected}
        step={customStep ?? "start"}
      />
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function OrdersHeader({
  backHref,
  onMenu,
  showMenu = false,
  title,
}: {
  backHref: string;
  onMenu?: () => void;
  showMenu?: boolean;
  title: string;
}) {
  return (
    <Header
      backHref={backHref}
      backLabel="이전 화면으로 돌아가기"
      className="border-none"
      onMenu={onMenu}
      showMenu={showMenu}
      title={<span data-qa="orders-title">{title}</span>}
    />
  );
}

function OrderListItem({
  highlighted = false,
  order,
}: {
  highlighted?: boolean;
  order: SellerOrderViewModel;
}) {
  return (
    <Link
      className={cn(
        "flex h-[102px] w-full gap-4 p-4",
        highlighted ? "bg-surface-subtle" : "bg-surface-default",
      )}
      data-qa="orders-list-item"
      href={`/seller/orders/${order.id}?view=selected`}
    >
      <div className="relative size-[70px] shrink-0 overflow-hidden rounded-seller-sm bg-surface-subtle">
        {order.thumbnailUrl ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="70px"
            src={order.thumbnailUrl}
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between whitespace-nowrap">
        <p
          className="truncate text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-primary"
          data-qa="orders-pickup-time"
        >
          {formatTime(order.pickupAt)}
        </p>
        <p
          className="min-w-0 truncate text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-tertiary"
          data-qa="orders-meta"
        >
          {formatMonthDay(order.pickupAt)} · {order.buyerName} 님
        </p>
        <p
          className="truncate text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary"
          data-qa="orders-price"
        >
          {formatPrice(order.paidAmount)}
        </p>
      </div>
    </Link>
  );
}

function DateFilterSheet({
  onClose,
  onCustom,
  onSelect,
  open,
  selectedPreset,
  selectedRange,
}: {
  onClose: () => void;
  onCustom: () => void;
  onSelect: (preset: FilterPreset) => void;
  open: boolean;
  selectedPreset: FilterPreset | null;
  selectedRange: { end: string; start: string };
}) {
  const presets: FilterPreset[] = ["1개월", "3개월", "6개월", "직접선택"];
  const disabled = !selectedPreset;

  return (
    <BottomSheet onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
      <div
        className="flex w-full flex-col items-center gap-8"
        data-qa="orders-filter-sheet"
      >
        <div className="flex w-full flex-col gap-2">
          <SheetTitle className="h-12" onClose={onClose}>
            조회기간 선택
          </SheetTitle>
          <div className="flex w-full gap-2">
            {presets.map((preset) => (
              <button
                className={cn(
                  "h-11 rounded-seller-sm bg-surface-subtle px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-secondary",
                  selectedPreset === preset &&
                    "bg-brand-primary text-text-inverse",
                )}
                data-qa="orders-filter-preset"
                key={preset}
                onClick={() => {
                  if (preset === "직접선택") {
                    onCustom();
                    return;
                  }

                  onSelect(preset);
                }}
                type="button"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="flex w-full gap-[10px]">
          <DateField
            active={!disabled}
            label="시작일"
            value={selectedRange.start}
          />
          <DateField
            active={!disabled}
            label="종료일"
            value={selectedRange.end}
          />
        </div>
        <button
          className="flex h-[52px] w-full items-center justify-center rounded-seller-md bg-brand-primary px-6 text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled"
          disabled={disabled}
          onClick={onClose}
          type="button"
        >
          확인
        </button>
      </div>
    </BottomSheet>
  );
}

function CustomDateSheet({
  onBack,
  onClose,
  onNext,
  onSelectDate,
  open,
  selected,
  step,
}: {
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onSelectDate: () => void;
  open: boolean;
  selected: boolean;
  step: CustomDateStep;
}) {
  const title =
    step === "end" ? "종료일" : step === "done" ? "종료일" : "시작일";
  const nextLabel = step === "done" ? "확인" : "다음";
  const nextDisabled = step !== "done" && !selected;

  return (
    <BottomSheet
      className="bg-surface-elevated shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      open={open}
    >
      <div
        className="flex w-full flex-col gap-4"
        data-qa="orders-custom-date-sheet"
      >
        <div>
          <SheetTitle onClose={onClose}>{title}</SheetTitle>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex h-6 items-center justify-center gap-4 overflow-hidden">
            <ChevronLeft
              aria-hidden="true"
              className="size-6 text-icon-disabled"
            />
            <p className="text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-primary">
              2026년 8월
            </p>
            <ChevronRight
              aria-hidden="true"
              className="size-6 text-icon-default"
            />
          </div>
          <CalendarGrid
            onSelect={onSelectDate}
            selectedDay={selected || step === "done" ? 18 : null}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-seller-md border border-border-default bg-surface-default px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            data-qa="orders-custom-date-back"
            onClick={onBack}
            type="button"
          >
            뒤로가기
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-seller-md bg-brand-primary px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled"
            data-qa="orders-custom-date-next"
            disabled={nextDisabled}
            onClick={onNext}
            type="button"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function SheetTitle({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
}) {
  return (
    <div
      className={cn("flex h-7 w-full items-start justify-between", className)}
    >
      <h2 className="text-seller-heading-lg leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {children}
      </h2>
      <button
        aria-label="닫기"
        className="flex size-10 items-center justify-end text-icon-default"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}

function DateField({
  active = false,
  label,
  value,
}: {
  active?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
        {label}
      </span>
      <div className="flex h-14 items-center justify-between rounded-seller-md bg-brand-subtle p-4">
        <span
          className={`text-[18px] leading-6 font-semibold tracking-[-0.54px] ${
            active ? "text-text-secondary" : "text-text-unavailable"
          }`}
        >
          {value}
        </span>
        <CalendarDays
          aria-hidden="true"
          className={cn(
            "size-6",
            active ? "text-icon-default" : "text-icon-muted",
          )}
        />
      </div>
    </div>
  );
}

function CalendarGrid({
  onSelect,
  selectedDay,
}: {
  onSelect: () => void;
  selectedDay: number | null;
}) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const cells = [
    ...Array.from({ length: 6 }, () => null),
    ...Array.from({ length: 31 }, (_, index) => index + 1),
    ...Array.from({ length: 5 }, () => null),
  ];

  return (
    <div className="flex flex-col gap-1" data-qa="orders-calendar">
      <div className="grid h-6 grid-cols-7">
        {days.map((day, index) => (
          <span
            className={cn(
              "flex items-center justify-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary",
              index === 0 && "text-text-error",
            )}
            key={day}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const isSunday = index % 7 === 0;
          const isSelected = day !== null && selectedDay === day;

          return (
            <button
              aria-label={day ? `${day}일` : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-seller-sm text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary",
                isSunday && "text-text-error",
                isSelected && "bg-brand-primary text-text-inverse",
              )}
              disabled={!day}
              key={`${day ?? "empty"}-${index}`}
              onClick={day ? onSelect : undefined}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: SellerOrderStatus | null }) {
  const label = status ? statusLabels[status] : "상태 미정";
  const isPaid = status === "PAID";
  const isCanceled =
    status === "CANCELED" ||
    status === "REFUNDED" ||
    status === "REFUND_PROCESSING" ||
    status === "CANCEL_REQUESTED";

  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center rounded-seller-sm px-2 py-1 text-[13px] leading-4 font-medium tracking-[-0.13px]",
        isPaid && "bg-status-success-bg text-status-success",
        isCanceled && "bg-status-warning-bg text-status-warning",
        !status && "bg-surface-subtle text-text-tertiary",
        status === "PICKED_UP" && "bg-status-info-bg text-status-info",
      )}
      data-qa="orders-status-badge"
    >
      {label}
    </span>
  );
}

function OrdersState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-[320px] items-center justify-center px-4 text-center text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-tertiary"
      data-qa="orders-state"
    >
      {message}
    </div>
  );
}

function getOrdersForState(
  state: ForcedState,
  apiOrders: SellerOrderListItem[] | undefined,
) {
  if (state === "empty" || state === "loading" || state === "error") {
    return [];
  }

  if (state === "long") {
    return [longTextSellerOrderFixture, ...sellerOrderViewFixtures.slice(1, 3)];
  }

  if (state === "null-status") {
    return [
      nullStatusSellerOrderFixture,
      ...sellerOrderViewFixtures.slice(1, 3),
    ];
  }

  return (apiOrders ?? []).map(toOrderViewModel);
}

function toOrderViewModel(order: SellerOrderListItem): SellerOrderViewModel {
  const fixture = sellerOrderViewFixtures.find((item) => item.id === order.id);

  return {
    ...order,
    buyerName: fixture?.buyerName ?? "고객",
    detailRows: fixture?.detailRows ?? [
      { label: "디자인", value: order.menuName, price: null },
      { label: "옵션", value: order.optionSummary, price: null },
    ],
    storeName: fixture?.storeName ?? "스토어",
    thumbnailUrl: fixture?.thumbnailUrl ?? null,
  };
}

function groupOrdersByPaymentDate(orders: SellerOrderViewModel[]) {
  const groups = new Map<string, SellerOrderViewModel[]>();

  for (const order of orders) {
    const label = formatFullDate(order.createdAt);
    groups.set(label, [...(groups.get(label) ?? []), order]);
  }

  return Array.from(groups.entries()).map(([label, groupOrders]) => ({
    label,
    orders: groupOrders,
  }));
}

function parseForcedState(value: string | null): ForcedState {
  if (
    value === "loading" ||
    value === "empty" ||
    value === "error" ||
    value === "long" ||
    value === "null-status"
  ) {
    return value;
  }

  return null;
}

export {
  OrderStatusBadge,
  OrdersHeader,
  formatFullDate,
  formatPrice,
  formatTime,
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatMonthDay(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    weekday: "long",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function toIsoDate(value: string) {
  return value.replaceAll(".", "-");
}

function toDisplayDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function rangeForPreset(preset: FilterPreset) {
  const end = new Date();
  const start = new Date(end);

  if (preset === "3개월") {
    start.setMonth(start.getMonth() - 3);
  } else if (preset === "6개월") {
    start.setMonth(start.getMonth() - 6);
  } else {
    start.setMonth(start.getMonth() - 1);
  }

  return {
    end: toDisplayDate(end),
    start: toDisplayDate(start),
  };
}
