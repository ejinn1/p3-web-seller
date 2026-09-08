"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Menu, SlidersHorizontal, X } from "lucide-react";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { revenueCancelHistory } from "@/features/revenue/model/revenue-fixtures";
import { useSellerOrdersQuery } from "@/features/orders/model/order-queries";
import type {
  SellerOrderListItem,
  SellerOrderStatus,
} from "@/features/orders/model/order-types";
import { useSellerRevenueQuery } from "@/features/revenue/model/revenue-queries";
import type {
  RevenueCancelHistory,
  RevenueOrderLine,
  RevenuePeriod,
  SellerRevenueResponse,
  RevenueSummaryMetric,
  RevenueSummarySection,
  RevenueView,
} from "@/features/revenue/model/revenue-types";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";
import { cn } from "@/lib/utils";

type RevenueScreenProps = {
  initialView: RevenueView;
};

type RevenueRange = {
  startDate: string;
  endDate: string;
};

const periods: { id: RevenuePeriod; label: string }[] = [
  { id: "today", label: "오늘" },
  { id: "week", label: "1주" },
  { id: "month", label: "1개월" },
  { id: "sixMonths", label: "6개월" },
  { id: "custom", label: "기간 선택" },
];

const detailTitles: Record<Exclude<RevenueView, "home">, string> = {
  payments: "주문 내역",
  discounts: "주문 내역",
  cancellations: "주문 내역",
  "cancel-history": "주문 내역",
};

export function RevenueScreen({ initialView }: RevenueScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activePeriod = parsePeriod(searchParams.get("period"));
  const customRange = parseCustomRange(searchParams);
  const range = rangeForPeriod(activePeriod, customRange);
  const { data: revenue } = useSellerRevenueQuery(
    range.startDate,
    range.endDate,
  );
  const view = initialView;
  const orderStatuses = statusesForView(view);
  const ordersQuery = useSellerOrdersQuery(
    {
      dateBasis: "PAID_AT",
      endDate: range.endDate,
      startDate: range.startDate,
      status: orderStatuses,
    },
    view !== "discounts",
  );
  const orders = ordersQuery.data ?? [];
  const summarySections = toSummarySections(revenue, orders);

  const goToView = (
    nextView: RevenueView,
    options: { preservePeriod?: boolean } = {},
  ) => {
    router.push(
      buildRevenueHref({
        customRange,
        period: activePeriod,
        preservePeriod: options.preservePeriod ?? true,
        view: nextView,
      }),
    );
  };

  const selectPeriod = (period: RevenuePeriod) => {
    router.push(
      buildRevenueHref({
        customRange: period === "custom" ? range : undefined,
        period,
        view,
      }),
    );
  };

  if (view === "cancel-history") {
    return (
      <>
        <SellerResponsiveFrame
          className="bg-surface-subtle"
          data-revenue-frame="cancel-history"
        >
          <RevenueHeader
            onBack={() => goToView("cancellations")}
            onMenu={() => setSidebarOpen(true)}
            showMenu
            title={detailTitles[view]}
          />
          <CancelHistoryView history={revenueCancelHistory} />
        </SellerResponsiveFrame>
        <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
      </>
    );
  }

  if (view !== "home") {
    return (
      <>
        <SellerResponsiveFrame data-revenue-frame={view}>
          <RevenueHeader
            onBack={() => goToView("home")}
            onMenu={() => setSidebarOpen(true)}
            showMenu
            title={detailTitles[view]}
          />
          <RevenueDetailView
            lines={getLinesForView(view, orders)}
            onClearFilter={() => goToView("home", { preservePeriod: false })}
            onSelectLine={() =>
              view === "cancellations" ? goToView("cancel-history") : undefined
            }
            range={range}
            tone={view === "cancellations" ? "danger" : "default"}
          />
        </SellerResponsiveFrame>
        <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
      </>
    );
  }

  return (
    <SellerResponsiveFrame data-revenue-frame="home">
      <RevenueHeader
        onBack={() => router.push(getSellerBackHref("revenue"))}
        onMenu={() => setSidebarOpen(true)}
        showMenu
        title="매출 분석"
      />
      <section className="flex flex-col" data-node-id="1290:16176">
        <PeriodTabs activePeriod={activePeriod} onSelect={selectPeriod} />
        <div className="mt-1 flex h-14 items-center px-4" data-node-id="1326:22954">
          <h2
            className="text-[18px] leading-[24px] font-semibold tracking-[-0.54px]"
            data-typography="revenue-month-heading"
          >
            {formatRangeLabel(range.startDate, range.endDate)}
          </h2>
        </div>
        <div
          className="flex flex-col gap-4 bg-surface-subtle px-4 pt-4 pb-[34px]"
          data-node-id="1326:22953"
        >
          {summarySections.map((section) => (
            <SummaryCard
              key={section.id}
              section={section}
              onNavigate={() => goToView(section.view)}
            />
          ))}
        </div>
      </section>
      {revenue ? (
        <span className="sr-only">
          API revenue range: {revenue.startDate} - {revenue.endDate}
        </span>
      ) : null}
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function RevenueHeader({
  onBack,
  onMenu,
  showMenu = false,
  title,
}: {
  onBack?: () => void;
  onMenu?: () => void;
  showMenu?: boolean;
  title: string;
}) {
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between bg-surface-default"
      data-revenue-element="header"
    >
      <div className="flex min-w-0 flex-1 items-center">
        {onBack ? (
          <button
            aria-label="뒤로 가기"
            className="flex size-11 items-center justify-center text-icon-default"
            onClick={onBack}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
      <h1
        className="text-[22px] leading-[30px] font-bold tracking-[-0.66px]"
        data-typography="revenue-header-title"
      >
        {title}
      </h1>
      <div className="flex min-w-0 flex-1 items-center justify-end px-1">
        {showMenu ? (
          <button
            aria-label="메뉴"
            className="flex size-11 items-center justify-center text-icon-default"
            onClick={onMenu}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </header>
  );
}

function PeriodTabs({
  activePeriod,
  onSelect,
}: {
  activePeriod: RevenuePeriod;
  onSelect: (period: RevenuePeriod) => void;
}) {
  return (
    <div
      className="flex w-full gap-2 overflow-x-auto px-4 pt-4 pb-2"
      data-revenue-element="period-tabs"
      data-node-id="1290:16226"
    >
      {periods.map((period) => {
        const isActive = period.id === activePeriod;

        return (
          <button
            className={cn(
              "flex h-11 shrink-0 items-center justify-center rounded-[12px] px-4 text-[15px] leading-[20px] font-semibold tracking-[-0.3px]",
              isActive
                ? "bg-surface-inverse text-text-inverse"
                : "bg-surface-subtle text-text-secondary",
            )}
            data-active={isActive}
            key={period.id}
            onClick={() => onSelect(period.id)}
            type="button"
          >
            <span data-typography="revenue-period-tab">{period.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryCard({
  onNavigate,
  section,
}: {
  onNavigate: () => void;
  section: RevenueSummarySection;
}) {
  return (
    <article
      className="flex w-full flex-col gap-6 rounded-[12px] bg-surface-elevated p-4"
      data-revenue-element="summary-card"
    >
      <SummaryMetric
        metric={section.primary}
        onNavigate={onNavigate}
        size="large"
      />
      <div className="grid grid-cols-2 gap-2">
        {section.secondary.map((metric) => (
          <SummaryMetric
            key={metric.label}
            metric={metric}
            onNavigate={onNavigate}
            size="small"
          />
        ))}
      </div>
    </article>
  );
}

function SummaryMetric({
  metric,
  onNavigate,
  size,
}: {
  metric: RevenueSummaryMetric;
  onNavigate: () => void;
  size: "large" | "small";
}) {
  return (
    <div className="flex h-[72px] flex-col gap-2" data-revenue-element="summary-metric">
      <p
        className="text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-text-tertiary"
        data-typography="revenue-summary-label"
      >
        {metric.label}
      </p>
      <div className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <strong
            className={cn(
              "font-bold tracking-[-0.66px]",
              size === "large"
                ? "text-[28px] leading-[36px] tracking-[-0.84px]"
                : "text-[22px] leading-[30px]",
              metric.tone === "danger" && "text-text-error",
              metric.tone === "muted" && "text-text-tertiary",
            )}
            data-typography={`revenue-number-${size}`}
          >
            {formatNumber(metric.value)}
          </strong>
          <span
            className="text-[11px] leading-[16px] font-medium tracking-[-0.11px] text-text-tertiary"
            data-typography="revenue-number-unit"
          >
            {metric.unit}
          </span>
        </div>
        <button
          aria-label={`${metric.label} 내역 보기`}
          className="flex size-12 items-center justify-center text-icon-default"
          onClick={onNavigate}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function RevenueDetailView({
  lines,
  onClearFilter,
  onSelectLine,
  range,
  tone,
}: {
  lines: RevenueOrderLine[];
  onClearFilter: () => void;
  onSelectLine?: () => void;
  range: RevenueRange;
  tone: "default" | "danger";
}) {
  return (
    <section className="flex flex-1 flex-col" data-revenue-element="detail-view">
      <div
        className="flex h-[60px] items-center gap-2 px-4 pt-4 pb-2"
        data-revenue-element="detail-filter"
      >
        <button
          aria-label="필터"
          className="flex size-9 items-center justify-center rounded-[12px] bg-surface-inverse text-icon-inverse"
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
        <button
          className="flex h-9 items-center rounded-[12px] bg-surface-hover py-2 pr-0 pl-4 text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-text-secondary"
          onClick={onClearFilter}
          type="button"
        >
          <span data-typography="revenue-date-chip">
            {formatCompactRangeLabel(range.startDate, range.endDate)}
          </span>
          <span className="flex size-12 items-center justify-center" aria-hidden="true">
            <X className="size-4" strokeWidth={2} />
          </span>
        </button>
      </div>
      <div className="mt-1 flex flex-col">
        <div className="flex h-[46px] items-start px-4 pt-4 pb-2">
          <h2
            className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px]"
            data-typography="revenue-detail-date"
          >
            {formatRangeLabel(range.startDate, range.endDate)}
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {lines.map((line, index) => (
            <RevenueOrderRow
              emphasized={index === 0 && lines.length > 1 && tone === "default"}
              key={line.id}
              line={line}
              onClick={onSelectLine}
              tone={tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RevenueOrderRow({
  emphasized,
  line,
  onClick,
  tone,
}: {
  emphasized: boolean;
  line: RevenueOrderLine;
  onClick?: () => void;
  tone: "default" | "danger";
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        "flex w-full gap-4 p-4 text-left",
        emphasized ? "bg-surface-subtle" : "bg-surface-default",
      )}
      data-revenue-element="order-row"
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <Image
        alt=""
        className="size-[70px] shrink-0 rounded-[12px] object-cover"
        height={70}
        priority
        src={line.imageSrc}
        width={70}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch whitespace-nowrap">
        <p
          className="w-fit text-[18px] leading-[24px] font-semibold tracking-[-0.54px]"
          data-typography="revenue-row-time"
        >
          {line.timeLabel}
        </p>
        <p
          className="w-full overflow-hidden text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-ellipsis text-text-tertiary"
          data-typography="revenue-row-meta"
        >
          {line.pickupLabel} · {line.customerName} 님
        </p>
        <p
          className={cn(
            "w-fit text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-secondary",
            tone === "danger" && "text-text-error",
          )}
          data-typography="revenue-row-amount"
        >
          {formatCurrency(line.amount)}
        </p>
      </div>
    </Component>
  );
}

function CancelHistoryView({ history }: { history: RevenueCancelHistory }) {
  return (
    <section
      className="flex flex-1 flex-col gap-8 px-4 pt-4 pb-[34px]"
      data-revenue-element="cancel-history-view"
    >
      <article
        className="flex w-full flex-col gap-8 rounded-[12px] bg-surface-default px-4 py-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_1px_3px_0_rgba(0,0,0,0.06)]"
        data-revenue-element="cancel-history-card"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <InfoRow label="결제일시" value={history.paymentDateTimeLabel} />
            <InfoRow label="픽업일시" value={history.pickupDateTimeLabel} />
            <InfoRow label="주문자" value={history.customerName} />
            <InfoRow label="스토어명" value={history.storeName} />
          </div>
          <div className="flex items-center justify-between">
            <span
              className="rounded-[12px] bg-surface-subtle px-2 py-1 text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-text-secondary"
            >
              <span data-typography="revenue-cancel-badge">{history.statusLabel}</span>
            </span>
            <strong
              className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-error"
              data-typography="revenue-cancel-total"
            >
              {formatCurrency(history.totalAmount)}
            </strong>
          </div>
        </div>
        <div className="h-px w-full bg-surface-subtle opacity-90" />
        <div className="flex flex-col gap-6">
          {history.options.map((option) => (
            <div className="flex flex-col gap-2" key={option.id}>
              <p
                className="w-fit text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-text-tertiary"
                data-typography="revenue-option-label"
              >
                {option.label}
              </p>
              <div className="flex items-center justify-between gap-4">
                <p
                  className="min-w-0 truncate text-[18px] leading-[24px] font-semibold tracking-[-0.54px]"
                  data-typography="revenue-option-value"
                >
                  {option.value}
                </p>
                <p
                  className="shrink-0 text-[15px] leading-[22px] font-semibold tracking-[-0.15px]"
                  data-typography="revenue-option-price"
                >
                  {option.priceLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-5 items-center justify-between gap-4">
      <p
        className="shrink-0 text-[13px] leading-[16px] font-medium tracking-[-0.13px] text-text-tertiary"
        data-typography="revenue-info-label"
      >
        {label}
      </p>
      <p
        className="truncate text-right text-[15px] leading-[20px] font-semibold tracking-[-0.3px]"
        data-typography="revenue-info-value"
      >
        {value}
      </p>
    </div>
  );
}

function getLinesForView(view: RevenueView, orders: SellerOrderListItem[]) {
  if (view === "discounts") {
    return [];
  }

  return orders.map((order) => toRevenueOrderLine(order));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)}원`;
}

function statusesForView(view: RevenueView): SellerOrderStatus[] | undefined {
  if (view === "cancellations" || view === "cancel-history") {
    return ["CANCEL_REQUESTED", "CANCELED", "REFUND_PROCESSING", "REFUNDED"];
  }

  if (view === "payments") {
    return ["PAID", "PICKED_UP"];
  }

  return undefined;
}

function toRevenueOrderLine(order: SellerOrderListItem): RevenueOrderLine {
  return {
    amount: order.paidAmount,
    customerName: "고객",
    id: order.id,
    imageSrc: "/revenue/cake-box.png",
    pickupLabel: formatMonthDay(order.pickupAt),
    timeLabel: formatShortTime(order.pickupAt),
  };
}

function toSummarySections(
  revenue: SellerRevenueResponse | undefined,
  orders: SellerOrderListItem[],
): RevenueSummarySection[] {
  const payments = orders.filter(
    (order) => order.status === "PAID" || order.status === "PICKED_UP",
  );
  const cancellations = orders.filter(
    (order) =>
      order.status === "CANCEL_REQUESTED" ||
      order.status === "CANCELED" ||
      order.status === "REFUND_PROCESSING" ||
      order.status === "REFUNDED",
  );
  const paymentAmount = revenue?.netSalesAmount ?? sumOrders(payments);
  const refundAmount =
    revenue?.completedRefundAmount ?? Math.abs(sumOrders(cancellations));

  return [
    {
      id: "sales",
      primary: { label: "실 매출", value: paymentAmount, unit: "원" },
      secondary: [
        {
          label: "평균 결제 금액",
          unit: "원",
          value: payments.length ? Math.round(paymentAmount / payments.length) : 0,
        },
        { label: "결제 건수", value: payments.length, unit: "건" },
      ],
      view: "payments",
    },
    {
      id: "discounts",
      primary: { label: "할인 금액", value: 0, unit: "원", tone: "muted" },
      secondary: [
        { label: "평균 결제 금액", value: 0, unit: "원", tone: "muted" },
        { label: "할인 건수", value: 0, unit: "건", tone: "muted" },
      ],
      view: "discounts",
    },
    {
      id: "cancellations",
      primary: {
        label: "취소 금액",
        tone: "danger",
        unit: "원",
        value: refundAmount,
      },
      secondary: [
        {
          label: "평균 취소 금액",
          tone: "danger",
          unit: "원",
          value: cancellations.length
            ? Math.round(refundAmount / cancellations.length)
            : 0,
        },
        {
          label: "취소 건수",
          tone: "danger",
          unit: "건",
          value: cancellations.length,
        },
      ],
      view: "cancellations",
    },
  ];
}

function sumOrders(orders: SellerOrderListItem[]) {
  return orders.reduce((sum, order) => sum + order.paidAmount, 0);
}

function parsePeriod(value: string | null): RevenuePeriod {
  if (
    value === "today" ||
    value === "week" ||
    value === "month" ||
    value === "sixMonths" ||
    value === "custom"
  ) {
    return value;
  }

  return "today";
}

function parseCustomRange(
  searchParams: URLSearchParams,
): RevenueRange | undefined {
  const startDate = parseIsoDateParam(searchParams.get("startDate"));
  const endDate = parseIsoDateParam(searchParams.get("endDate"));

  if (!startDate || !endDate || startDate > endDate) {
    return undefined;
  }

  return { endDate, startDate };
}

function parseIsoDateParam(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
}

function buildRevenueHref({
  customRange,
  period,
  preservePeriod = true,
  view,
}: {
  customRange?: RevenueRange;
  period: RevenuePeriod;
  preservePeriod?: boolean;
  view: RevenueView;
}) {
  const searchParams = new URLSearchParams();

  if (view !== "home") {
    searchParams.set("view", view);
  }

  if (preservePeriod) {
    searchParams.set("period", period);

    if (period === "custom" && customRange) {
      searchParams.set("startDate", customRange.startDate);
      searchParams.set("endDate", customRange.endDate);
    }
  }

  const query = searchParams.toString();
  return query ? `/seller/revenue?${query}` : "/seller/revenue";
}

function rangeForPeriod(
  period: RevenuePeriod,
  customRange?: RevenueRange,
): RevenueRange {
  if (period === "custom" && customRange) {
    return customRange;
  }

  const end = new Date();
  const start = new Date(end);

  if (period === "week") {
    start.setDate(start.getDate() - 6);
  } else if (period === "month") {
    start.setMonth(start.getMonth() - 1);
  } else if (period === "sixMonths") {
    start.setMonth(start.getMonth() - 6);
  }

  return { endDate: toIsoDate(end), startDate: toIsoDate(start) };
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatRangeLabel(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return formatKoreanDate(startDate);
  }

  return `${formatKoreanDate(startDate)} ~ ${formatKoreanDate(endDate)}`;
}

function formatCompactRangeLabel(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return startDate.replaceAll("-", ".");
  }

  return `${startDate.replaceAll("-", ".")} ~ ${endDate.replaceAll("-", ".")}`;
}

function formatKoreanDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatMonthDay(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatShortTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
