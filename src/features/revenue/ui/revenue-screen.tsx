"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, SlidersHorizontal, X } from "lucide-react";
import { SellerScreenShell } from "@/features/seller-shell/ui/seller-screen-shell";
import {
  revenueCancelHistory,
  revenueCancellationLines,
  revenueDiscountLines,
  revenuePaymentLines,
  revenueSummarySections,
} from "@/features/revenue/model/revenue-fixtures";
import { useSellerRevenueQuery } from "@/features/revenue/model/revenue-queries";
import type {
  RevenueCancelHistory,
  RevenueOrderLine,
  RevenuePeriod,
  RevenueSummaryMetric,
  RevenueSummarySection,
  RevenueView,
} from "@/features/revenue/model/revenue-types";
import { cn } from "@/lib/utils";

type RevenueScreenProps = {
  initialView: RevenueView;
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
  const { data: revenue } = useSellerRevenueQuery("2026-08-12", "2026-08-12");
  const view = initialView;

  const goToView = (nextView: RevenueView) => {
    router.push(nextView === "home" ? "/seller/revenue" : `/seller/revenue?view=${nextView}`);
  };

  if (view === "cancel-history") {
    return (
      <SellerScreenShell className="bg-surface-subtle" data-revenue-frame="cancel-history">
        <RevenueHeader title={detailTitles[view]} onBack={() => goToView("cancellations")} />
        <CancelHistoryView history={revenueCancelHistory} />
      </SellerScreenShell>
    );
  }

  if (view !== "home") {
    return (
      <SellerScreenShell data-revenue-frame={view}>
        <RevenueHeader title={detailTitles[view]} onBack={() => goToView("home")} />
        <RevenueDetailView
          lines={getLinesForView(view)}
          onClearFilter={() => goToView("home")}
          onSelectLine={() =>
            view === "cancellations" ? goToView("cancel-history") : undefined
          }
          tone={view === "cancellations" ? "danger" : "default"}
        />
      </SellerScreenShell>
    );
  }

  return (
    <SellerScreenShell data-revenue-frame="home">
      <RevenueHeader showMenu title="매출 분석" />
      <section className="flex flex-col" data-node-id="1290:16176">
        <PeriodTabs activePeriod="today" />
        <div className="mt-1 flex h-14 items-center px-4" data-node-id="1326:22954">
          <h2
            className="text-[18px] leading-[24px] font-semibold tracking-[-0.54px]"
            data-typography="revenue-month-heading"
          >
            2026년 8월 12일
          </h2>
        </div>
        <div
          className="flex flex-col gap-4 bg-surface-subtle px-4 pt-4 pb-[34px]"
          data-node-id="1326:22953"
        >
          {revenueSummarySections.map((section) => (
            <SummaryCard
              key={section.id}
              section={section}
              onNavigate={() => goToView(section.view)}
            />
          ))}
        </div>
      </section>
      <span className="sr-only">
        API revenue range: {revenue.startDate} - {revenue.endDate}
      </span>
    </SellerScreenShell>
  );
}

function RevenueHeader({
  onBack,
  showMenu = false,
  title,
}: {
  onBack?: () => void;
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
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </header>
  );
}

function PeriodTabs({ activePeriod }: { activePeriod: RevenuePeriod }) {
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
  tone,
}: {
  lines: RevenueOrderLine[];
  onClearFilter: () => void;
  onSelectLine?: () => void;
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
          <span data-typography="revenue-date-chip">2026.08.12</span>
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
            2026년 8월 12일
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

function getLinesForView(view: RevenueView) {
  if (view === "discounts") {
    return revenueDiscountLines;
  }

  if (view === "cancellations") {
    return revenueCancellationLines;
  }

  return revenuePaymentLines;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)}원`;
}
