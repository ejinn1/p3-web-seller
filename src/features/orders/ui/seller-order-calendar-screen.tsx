"use client";

import {
  ChevronLeft,
  ChevronRight,
  Menu,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import {
  orderCalendarDayRevenue,
  orderCalendarDisplayMeta,
  orderCalendarMonthlyMetrics,
  orderCalendarOptionLines,
} from "@/features/orders/model/order-calendar-fixtures";
import {
  useSellerOrderCalendarMonthQuery,
  useSellerOrderDetailQuery,
} from "@/features/orders/model/order-calendar-queries";
import type {
  OrderCalendarDay,
  OrderCalendarItem,
  SellerOrderDetailResponse,
} from "@/features/orders/model/order-calendar-types";
import { cn } from "@/lib/utils";

const defaultYear = 2026;
const defaultMonth = 8;
const defaultListDate = "2026-08-12";
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarView = "calendar" | "list" | "detail";

type CalendarGridDate = {
  date: string;
  day: number;
  isDisabled: boolean;
  isOutsideMonth: boolean;
  weekDay: number;
};

export function SellerOrderCalendarScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as CalendarView | null) ?? "calendar";
  const year = Number(searchParams.get("year") ?? defaultYear);
  const month = Number(searchParams.get("month") ?? defaultMonth);
  const selectedDate = searchParams.get("date");
  const activeDate = selectedDate ?? defaultListDate;
  const isMonthPickerOpen = searchParams.get("monthPicker") === "1";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const calendarQuery = useSellerOrderCalendarMonthQuery({ month, year });
  const calendar = calendarQuery.data;
  const selectedDay = calendar?.days.find((day) => day.date === activeDate);
  const selectedOrderId =
    searchParams.get("orderId") ?? selectedDay?.orders[0]?.orderId ?? null;
  const detailQuery = useSellerOrderDetailQuery(
    view === "detail" ? selectedOrderId : null,
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  if (calendarQuery.isLoading || !calendar) {
    return (
      <SellerResponsiveFrame className="items-center justify-center">
        <p className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary">
          주문 캘린더를 불러오는 중입니다.
        </p>
      </SellerResponsiveFrame>
    );
  }

  if (view === "detail") {
    return (
      <>
        <SellerOrderDetailView
          detail={detailQuery.data}
          isLoading={detailQuery.isLoading}
          onBack={() =>
            updateParams({
              orderId: null,
              view: "list",
              date: activeDate,
            })
          }
          onMenu={() => setSidebarOpen(true)}
        />
        <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
      </>
    );
  }

  if (view === "list") {
    return (
      <>
        <SellerOrderListView
          date={activeDate}
          day={selectedDay}
          onBack={() => updateParams({ orderId: null, view: null })}
          onClearDate={() => updateParams({ date: null, view: null })}
          onMenu={() => setSidebarOpen(true)}
          onOpenDetail={(orderId) =>
            updateParams({ orderId, view: "detail", date: activeDate })
          }
        />
        <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
      </>
    );
  }

  return (
    <>
      <SellerResponsiveFrame>
        <CalendarHeader
          onBack={() => router.push("/seller/orders")}
          onMenu={() => setSidebarOpen(true)}
          title="주문 캘린더"
        />
        <section
          className="bg-surface-subtle px-4 pt-4 pb-6"
          data-testid="calendar-summary-section"
        >
          <div
            className="flex h-[142px] w-full flex-col items-center justify-center gap-8 rounded-seller-sm bg-surface-default p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)]"
            data-testid="calendar-summary-card"
          >
            <MonthPickerButton
              month={month}
              onNext={() =>
                updateParams({ month: String(month === 12 ? 1 : month + 1) })
              }
              onOpen={() => updateParams({ monthPicker: "1" })}
              onPrevious={() =>
                updateParams({ month: String(month === 1 ? 12 : month - 1) })
              }
              year={year}
            />
            <MonthlySummary />
          </div>
        </section>
        <OrderCalendarGrid
          days={calendar.days}
          month={month}
          onSelectDate={(date, hasOrders) => {
            if (selectedDate === date && hasOrders) {
              updateParams({ date, view: "list" });
              return;
            }

            updateParams({ date, view: null, orderId: null });
          }}
          selectedDate={selectedDate}
          year={year}
        />
      </SellerResponsiveFrame>
      <MonthSelectSheet
        initialMonth={month}
        initialYear={year}
        onClose={() => updateParams({ monthPicker: null })}
        onConfirm={(nextYear, nextMonth) =>
          updateParams({
            date: null,
            month: String(nextMonth),
            monthPicker: null,
            orderId: null,
            view: null,
            year: String(nextYear),
          })
        }
        open={isMonthPickerOpen}
      />
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </>
  );
}

function CalendarHeader({
  className,
  onBack,
  onMenu,
  title,
}: {
  className?: string;
  onBack: () => void;
  onMenu?: () => void;
  title: string;
}) {
  return (
    <header
      className={cn(
        "flex h-14 w-full shrink-0 items-center justify-between overflow-hidden bg-surface-default",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <button
          aria-label="뒤로 가기"
          className="flex size-11 items-center justify-center text-icon-default"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
        </button>
      </div>
      <h1 className="shrink-0 text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        {title}
      </h1>
      <div className="flex min-w-0 flex-1 justify-end">
        {onMenu ? (
          <button
            aria-label="메뉴"
            className="flex size-12 items-center justify-center text-icon-default"
            onClick={onMenu}
            type="button"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </header>
  );
}

function MonthPickerButton({
  month,
  onNext,
  onOpen,
  onPrevious,
  year,
}: {
  month: number;
  onNext: () => void;
  onOpen: () => void;
  onPrevious: () => void;
  year: number;
}) {
  return (
    <div
      className="flex h-6 w-[calc(100%+36px)] items-center justify-center overflow-hidden"
      data-testid="calendar-month-picker"
    >
      <button
        aria-label="이전 달"
        className="flex size-12 items-center justify-center text-icon-disabled"
        onClick={onPrevious}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </button>
      <button
        className="flex h-6 items-center justify-center px-4 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary"
        onClick={onOpen}
        type="button"
      >
        {year}년 {month}월
      </button>
      <button
        aria-label="다음 달"
        className="flex size-12 items-center justify-center text-icon-default"
        onClick={onNext}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}

function MonthlySummary() {
  return (
    <div
      className="-mx-px flex w-[calc(100%+2px)] items-start gap-1 text-center"
      data-testid="calendar-metrics-row"
    >
      <SummaryMetric
        amount={orderCalendarMonthlyMetrics.revenueAmount}
        label="이번 달 매출"
      />
      <div className="h-[54px] w-px shrink-0 bg-surface-subtle opacity-90" />
      <SummaryMetric
        amount={orderCalendarMonthlyMetrics.canceledAmount}
        label="이번 달 취소"
        tone="error"
      />
    </div>
  );
}

function SummaryMetric({
  amount,
  label,
  tone = "default",
}: {
  amount: number;
  label: string;
  tone?: "default" | "error";
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
      <p className="w-full text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <div className="flex w-full items-center justify-center gap-2 whitespace-nowrap">
        <p
          className={cn(
            "text-[22px] leading-[30px] font-bold tracking-[-0.66px]",
            tone === "error" ? "text-text-error" : "text-text-primary",
          )}
        >
          {amount.toLocaleString("ko-KR")}
        </p>
        <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
          원
        </p>
      </div>
    </div>
  );
}

function OrderCalendarGrid({
  days,
  month,
  onSelectDate,
  selectedDate,
  year,
}: {
  days: OrderCalendarDay[];
  month: number;
  onSelectDate: (date: string, hasOrders: boolean) => void;
  selectedDate: string | null;
  year: number;
}) {
  const dayByDate = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const gridDates = useMemo(
    () => buildCalendarGrid(year, month),
    [year, month],
  );

  return (
    <section
      className="flex h-[550.857px] w-full flex-col items-start px-4 py-6"
      data-testid="calendar-section"
    >
      <div className="flex w-full flex-col gap-1">
        <div
          className="grid h-6 w-full grid-cols-7"
          data-testid="calendar-weekday-row"
        >
          {weekdays.map((day, index) => (
            <div
              className="flex min-w-0 items-center justify-center overflow-hidden rounded-full"
              key={day}
            >
              <span
                className={cn(
                  "text-center text-[13px] leading-4 font-medium tracking-[-0.13px]",
                  index === 0 ? "text-text-error" : "text-text-secondary",
                )}
                data-testid={`calendar-weekday-${index}`}
              >
                {day}
              </span>
            </div>
          ))}
        </div>
        <div className="grid w-full grid-cols-7" data-testid="calendar-grid">
          {gridDates.map((gridDate, index) => {
            const day = dayByDate.get(gridDate.date);
            const isSelected =
              !gridDate.isOutsideMonth && selectedDate === gridDate.date;
            const hasOrders = Boolean(day?.orders.length);
            const revenue = orderCalendarDayRevenue[gridDate.date];

            return (
              <div
                className="flex min-w-0 flex-col items-center"
                data-date={gridDate.date}
                data-testid="calendar-grid-cell"
                key={`${gridDate.date}-${index}`}
              >
                <button
                  aria-label={`${gridDate.day}일 선택`}
                  className={cn(
                    "flex h-12 w-full items-center justify-center overflow-hidden rounded-seller-sm text-[15px] leading-[22px] font-semibold tracking-[-0.15px]",
                    gridDate.isOutsideMonth && "pointer-events-none opacity-0",
                    gridDate.isDisabled
                      ? "text-text-unavailable"
                      : gridDate.weekDay === 0
                        ? "text-text-error"
                        : "text-text-primary",
                    isSelected && "bg-surface-subtle",
                  )}
                  data-selected={isSelected ? "true" : "false"}
                  data-testid={
                    isSelected ? "calendar-selected-cell" : "calendar-date-cell"
                  }
                  disabled={gridDate.isDisabled || gridDate.isOutsideMonth}
                  onClick={() => onSelectDate(gridDate.date, hasOrders)}
                  type="button"
                >
                  {gridDate.day}
                </button>
                <span
                  className={cn(
                    "flex h-6 w-full items-center justify-center text-[11px] leading-4 font-medium tracking-[-0.11px] whitespace-nowrap",
                    gridDate.isOutsideMonth && "opacity-0",
                    gridDate.isDisabled
                      ? "text-text-unavailable"
                      : "text-text-secondary",
                  )}
                >
                  {revenue === 0 ? "0" : "000,000"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SellerOrderListView({
  date,
  day,
  onBack,
  onClearDate,
  onMenu,
  onOpenDetail,
}: {
  date: string;
  day?: OrderCalendarDay;
  onBack: () => void;
  onClearDate: () => void;
  onMenu: () => void;
  onOpenDetail: (orderId: string) => void;
}) {
  const orders = day?.orders ?? [];

  return (
    <SellerResponsiveFrame>
      <CalendarHeader onBack={onBack} onMenu={onMenu} title="주문 내역" />
      <section className="flex min-h-0 flex-1 flex-col gap-1">
        <div
          className="flex h-[60px] w-full shrink-0 items-center gap-2 px-4 pt-4 pb-2"
          data-testid="calendar-list-tabbar"
        >
          <button
            aria-label="필터"
            className="flex size-9 items-center justify-center rounded-seller-sm bg-surface-inverse text-icon-inverse"
            data-testid="calendar-filter-button"
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
          </button>
          <button
            className="flex h-9 w-[113px] items-center rounded-seller-sm bg-surface-hover py-2 pl-4 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary"
            data-testid="calendar-date-chip"
            onClick={onClearDate}
            type="button"
          >
            {formatDotDate(date)}
            <span className="ml-[-16px] flex size-12 items-center justify-end p-1.5">
              <X aria-hidden="true" className="size-4" />
            </span>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className="flex h-[46px] shrink-0 items-start gap-2 px-4 pt-4 pb-2"
            data-testid="calendar-list-title-row"
          >
            <h2 className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary">
              {formatKoreanDate(date)}
            </h2>
          </div>
          <div
            className="flex flex-col gap-2"
            data-testid="calendar-order-list"
          >
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <OrderListItem
                  highlighted={index === 0}
                  key={order.orderId}
                  onClick={() => onOpenDetail(order.orderId)}
                  order={order}
                />
              ))
            ) : (
              <div className="px-4 py-12 text-center text-[13px] leading-[18px] tracking-[-0.13px] text-text-tertiary">
                선택한 날짜의 주문 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </SellerResponsiveFrame>
  );
}

function OrderListItem({
  highlighted,
  onClick,
  order,
}: {
  highlighted?: boolean;
  onClick: () => void;
  order: OrderCalendarItem;
}) {
  const meta = orderCalendarDisplayMeta[order.orderId];

  return (
    <button
      className={cn(
        "flex h-[102px] w-full items-start gap-4 p-4 text-left",
        highlighted ? "bg-surface-subtle" : "bg-surface-default",
      )}
      data-testid="calendar-order-item"
      onClick={onClick}
      type="button"
    >
      <Image
        alt=""
        className="size-[70px] shrink-0 rounded-seller-sm object-cover"
        height={70}
        src={meta?.thumbnailUrl ?? "/revenue/cake-plain.png"}
        width={70}
      />
      <div className="flex h-[70px] min-w-0 flex-1 flex-col items-start justify-between whitespace-nowrap">
        <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {formatPickupTime(order.pickupTime)}
        </p>
        <p className="min-w-full overflow-hidden text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-ellipsis text-text-tertiary">
          8월 19일 · {meta?.buyerName ?? "고객"} 님
        </p>
        <p className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary">
          {formatWon(order.paidAmount)}
        </p>
      </div>
    </button>
  );
}

function SellerOrderDetailView({
  detail,
  isLoading,
  onBack,
  onMenu,
}: {
  detail?: SellerOrderDetailResponse;
  isLoading: boolean;
  onBack: () => void;
  onMenu: () => void;
}) {
  const order = detail?.order;
  const optionLines =
    detail && detail.optionRows.length > 0
      ? detail.optionRows.map((row) => ({
          label: row.label,
          price: row.amount === null ? "" : formatOptionPrice(row.amount),
          value: row.value,
        }))
      : orderCalendarOptionLines;

  return (
    <SellerResponsiveFrame className="bg-surface-subtle">
      <CalendarHeader
        className="bg-surface-default"
        onBack={onBack}
        onMenu={onMenu}
        title="주문 내역"
      />
      <section className="flex min-h-0 flex-1 flex-col gap-8 px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <div
          className="w-full rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)]"
          data-testid="calendar-order-detail"
        >
          {isLoading || !order ? (
            <p className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary">
              주문 내역을 불러오는 중입니다.
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 whitespace-nowrap">
                  <DetailInfoRow
                    label="결제일시"
                    testId="calendar-detail-row-createdAt"
                    value={formatDetailDate(order.createdAt)}
                  />
                  <DetailInfoRow
                    label="픽업일시"
                    testId="calendar-detail-row-pickupAt"
                    value={formatDetailPickupDate(order.pickupAt)}
                  />
                  <DetailInfoRow
                    label="주문자"
                    testId="calendar-detail-row-buyer"
                    value="이동후"
                  />
                  <DetailInfoRow
                    label="스토어명"
                    testId="calendar-detail-row-store"
                    value="위하다"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-6 w-[62px] items-center justify-center rounded-seller-sm bg-status-success-bg px-2 py-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-status-success"
                    data-testid="calendar-paid-badge"
                  >
                    결제완료
                  </span>
                  <p
                    className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary"
                    data-testid="calendar-detail-total"
                  >
                    {formatWon(order.paidAmount)}
                  </p>
                </div>
              </div>
              <div
                className="h-px w-full bg-surface-subtle opacity-90"
                data-testid="calendar-detail-divider"
              />
              <div className="flex flex-col gap-6 whitespace-nowrap">
                {optionLines.map((line) => (
                  <div
                    className="flex flex-col gap-2"
                    data-testid="calendar-option-line"
                    key={line.label}
                  >
                    <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
                      {line.label}
                    </p>
                    <div className="flex items-center justify-between text-text-primary">
                      <p className="text-[18px] leading-6 font-semibold tracking-[-0.54px]">
                        {line.value}
                      </p>
                      {line.price ? (
                        <p className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px]">
                          {line.price}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SellerResponsiveFrame>
  );
}

function DetailInfoRow({
  label,
  testId,
  value,
}: {
  label: string;
  testId?: string;
  value: string;
}) {
  return (
    <div className="flex h-5 items-center justify-between" data-testid={testId}>
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {value}
      </p>
    </div>
  );
}

function MonthSelectSheet({
  initialMonth,
  initialYear,
  onClose,
  onConfirm,
  open,
}: {
  initialMonth: number;
  initialYear: number;
  onClose: () => void;
  onConfirm: (year: number, month: number) => void;
  open: boolean;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const years = [year - 1, year - 1, year, year - 1, year - 1];
  const months = [month - 2, month - 1, month, month + 1, month + 2].map(
    normalizeMonth,
  );

  return (
    <BottomSheet onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
      <div
        className="flex w-full flex-col items-center gap-8"
        data-testid="calendar-month-sheet"
      >
        <div className="flex h-12 w-full items-start justify-between">
          <h2 className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
            월 선택
          </h2>
          <button
            aria-label="닫기"
            className="flex size-12 translate-x-2 -translate-y-2 items-center justify-center text-icon-default"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div
          className="relative h-[214px] w-full overflow-hidden"
          data-testid="calendar-month-wheel-area"
        >
          <div className="flex h-full w-full gap-2">
            <WheelColumn
              hideOuterRows
              testId="calendar-year-wheel"
              items={years.map((itemYear, index) => ({
                label: `${itemYear}년`,
                selected: index === 2,
                disabled: index === 0 || index > 2,
                onClick: () => setYear(itemYear),
              }))}
            />
            <WheelColumn
              testId="calendar-month-wheel"
              items={months.map((itemMonth, index) => ({
                label: `${itemMonth}월`,
                selected: index === 2,
                disabled: index === 0 || index === 4,
                onClick: () => setMonth(itemMonth),
              }))}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_4%,rgba(255,255,255,0)_50%,#ffffff_96%)]" />
        </div>
        <button
          className="flex h-[52px] w-full items-center justify-center rounded-seller-md bg-brand-primary px-6 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-inverse"
          data-testid="calendar-month-confirm"
          onClick={() => onConfirm(year, month)}
          type="button"
        >
          확인
        </button>
      </div>
    </BottomSheet>
  );
}

function WheelColumn({
  hideOuterRows = false,
  items,
  testId,
}: {
  hideOuterRows?: boolean;
  items: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
    selected?: boolean;
  }[];
  testId: string;
}) {
  return (
    <div
      className="flex h-[214px] min-w-0 flex-1 flex-col items-center"
      data-testid={testId}
    >
      {items.map((item, index) => (
        <button
          className={cn(
            "flex min-h-0 flex-1 items-center justify-center text-center text-[22px] leading-[30px] font-bold tracking-[-0.66px]",
            item.selected &&
              "w-full rounded-seller-sm bg-surface-subtle text-text-primary",
            !item.selected && item.disabled && "text-text-disabled",
            !item.selected && !item.disabled && "text-text-tertiary",
            hideOuterRows && index === 0 && "text-transparent",
            hideOuterRows && index > 2 && "text-transparent",
          )}
          key={`${item.label}-${index}`}
          onClick={item.onClick}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function buildCalendarGrid(year: number, month: number): CalendarGridDate[] {
  const monthIndex = month - 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekDay = new Date(year, monthIndex, 1).getDay();
  const cells: CalendarGridDate[] = [];

  for (let index = 0; index < firstWeekDay; index += 1) {
    cells.push({
      date: `${year}-${String(month).padStart(2, "0")}-blank-${index}`,
      day: 0,
      isDisabled: true,
      isOutsideMonth: true,
      weekDay: index,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const weekDay = new Date(year, monthIndex, day).getDay();

    cells.push({
      date,
      day,
      isDisabled: weekDay === 1,
      isOutsideMonth: false,
      weekDay,
    });
  }

  while (cells.length < 42) {
    const index = cells.length;
    cells.push({
      date: `${year}-${String(month).padStart(2, "0")}-blank-${index}`,
      day: 0,
      isDisabled: true,
      isOutsideMonth: true,
      weekDay: index % 7,
    });
  }

  return cells;
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatOptionPrice(amount: number) {
  return `+ ${amount.toLocaleString("ko-KR")}원`;
}

function formatDotDate(date: string) {
  const { day, month, year } = splitDate(date);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function formatKoreanDate(date: string) {
  const { day, month, year } = splitDate(date);
  return `${year}년 ${month}월 ${day}일`;
}

function formatPickupTime(time: string) {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  const minute = rawMinute ?? "00";
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour;

  return `${period} ${String(displayHour).padStart(2, "0")}:${minute}`;
}

function formatDetailDate(instant: string) {
  const date = new Date(instant);
  const hour = date.getHours();
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour;

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${String(displayHour).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDetailPickupDate(instant: string) {
  const date = new Date(instant);
  const hour = date.getHours();
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour;

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${displayHour}시${String(date.getMinutes()).padStart(2, "0")}`;
}

function splitDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { day, month, year };
}

function normalizeMonth(month: number) {
  if (month < 1) {
    return month + 12;
  }

  if (month > 12) {
    return month - 12;
  }

  return month;
}
