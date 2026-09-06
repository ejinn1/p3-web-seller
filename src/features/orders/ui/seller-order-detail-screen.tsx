"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SellerScreenShell } from "@/features/seller-shell/ui/seller-screen-shell";
import {
  findSellerOrderFixture,
  longTextSellerOrderFixture,
  nullStatusSellerOrderFixture,
  sellerOrderViewFixtures,
} from "@/features/orders/model/order-fixtures";
import {
  useCompleteSellerOrderPickupMutation,
  useRefundSellerOrderMutation,
} from "@/features/orders/model/order-mutations";
import { useSellerOrderQuery } from "@/features/orders/model/order-queries";
import type {
  SellerOrderDetail,
  SellerOrderViewModel,
} from "@/features/orders/model/order-types";
import {
  formatPrice,
  formatTime,
  OrderStatusBadge,
  OrdersHeader,
} from "@/features/orders/ui/seller-orders-screen";

type ForcedState = "loading" | "empty" | "error" | "long" | "null-status" | null;

export function SellerOrderDetailScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedState = parseForcedState(searchParams.get("state"));
  const isSelectedView = searchParams.get("view") === "selected";
  const query = useSellerOrderQuery(orderId, !forcedState);
  const pickupMutation = useCompleteSellerOrderPickupMutation(orderId);
  const refundMutation = useRefundSellerOrderMutation(orderId);
  const view = useMemo(
    () => getDetailForState(forcedState, query.data),
    [forcedState, query.data],
  );
  const isLoading = forcedState === "loading" || query.isLoading;
  const isError = forcedState === "error" || query.isError;

  return (
    <SellerScreenShell className="bg-surface-subtle">
      <OrdersHeader title="주문 내역" />
      <section className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-4 pb-[34px]">
        {isLoading ? <DetailState message="주문 상세를 불러오고 있어요." /> : null}
        {isError ? (
          <DetailState
            message={
              query.error instanceof Error
                ? query.error.message
                : "주문 상세를 불러오지 못했습니다."
            }
          />
        ) : null}
        {!isLoading && !isError && !view ? (
          <DetailState message="주문 상세 정보가 없습니다." />
        ) : null}
        {!isLoading && !isError && view ? (
          <OrderDetailCard selected={isSelectedView} view={view} />
        ) : null}
      </section>
      {isSelectedView && !isLoading && !isError && view?.order.status === "PAID" ? (
        <div className="flex gap-2 bg-surface-subtle px-4 pt-4 pb-[34px]">
          <Button
            className="h-11 flex-1 rounded-seller-md border-border-default text-[15px] leading-5 font-semibold tracking-[-0.3px] !text-text-secondary"
            data-qa="orders-refund-button"
            disabled={refundMutation.isPending}
            onClick={() => refundMutation.mutate(undefined)}
            variant="outline"
          >
            환불처리
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            data-qa="orders-pickup-button"
            disabled={pickupMutation.isPending}
            onClick={() => {
              pickupMutation.mutate(undefined, {
                onSuccess: () => router.push(`/seller/orders/${orderId}`),
              });
            }}
          >
            픽업 완료
          </Button>
        </div>
      ) : null}
    </SellerScreenShell>
  );
}

function OrderDetailCard({
  selected,
  view,
}: {
  selected: boolean;
  view: DetailView;
}) {
  const paymentDate = view.detail.paymentAttempt.completedAt ?? view.order.createdAt;
  const rows =
    selected && view.viewModel.selectedRows
      ? view.viewModel.selectedRows
      : view.viewModel.detailRows;

  return (
    <article
      className="flex w-full flex-col gap-8 overflow-hidden rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
      data-qa="orders-detail-card"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 whitespace-nowrap">
          <InfoRow
            label="결제일시"
            value={view.viewModel.detailPaymentText ?? formatDateTime(paymentDate)}
          />
          <InfoRow
            label="픽업일시"
            value={view.viewModel.detailPickupText ?? formatDateTime(view.order.pickupAt)}
          />
          <InfoRow
            label="주문자"
            value={view.viewModel.detailBuyerName ?? view.viewModel.buyerName}
          />
          <InfoRow label="스토어명" value={view.viewModel.storeName} />
        </div>
        <div className="flex items-center justify-between">
          <OrderStatusBadge status={view.order.status} />
          <p
            className="text-seller-display-sm leading-[30px] font-bold tracking-[-0.66px] text-text-primary"
            data-qa="orders-detail-price"
          >
            {formatPrice(view.order.paidAmount)}
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-surface-subtle opacity-90" />
      <div className="flex flex-col gap-6">
        {rows.map((row) => (
          <div className="flex flex-col gap-2" data-qa="orders-detail-row" key={row.label}>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
              {row.label}
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-primary">
                {row.value}
              </p>
              {row.price !== null ? (
                <p className="shrink-0 text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary">
                  {row.priceText ?? formatOptionPrice(row.price)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-5 items-center justify-between gap-4">
      <p className="shrink-0 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p
        className="min-w-0 truncate text-right text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
        data-qa="orders-detail-info-value"
      >
        {value}
      </p>
    </div>
  );
}

function DetailState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center rounded-seller-sm bg-surface-default px-4 text-center text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-tertiary"
      data-qa="orders-detail-state"
    >
      {message}
    </div>
  );
}

type DetailView = {
  detail: SellerOrderDetail;
  order: SellerOrderDetail["order"];
  viewModel: SellerOrderViewModel;
};

function getDetailForState(
  state: ForcedState,
  detail: SellerOrderDetail | undefined,
): DetailView | null {
  if (state === "empty" || state === "loading" || state === "error") {
    return null;
  }

  if (state === "long") {
    const fixture = findSellerOrderFixture(longTextSellerOrderFixture.id);
    return {
      detail: fixture.detail,
      order: { ...fixture.detail.order, ...longTextSellerOrderFixture },
      viewModel: longTextSellerOrderFixture,
    };
  }

  if (state === "null-status") {
    const fixture = findSellerOrderFixture(nullStatusSellerOrderFixture.id);
    return {
      detail: fixture.detail,
      order: { ...fixture.detail.order, ...nullStatusSellerOrderFixture },
      viewModel: nullStatusSellerOrderFixture,
    };
  }

  if (!detail) {
    return null;
  }

  const fixture = sellerOrderViewFixtures.find(
    (order) => order.id === detail.order.id,
  );
  const detailRows =
    detail.optionRows.length > 0
      ? detail.optionRows.map((row) => ({
          label: row.label,
          price: row.amount,
          value: row.value,
        }))
      : parseOptionRows(detail.order.optionSummary);

  return {
    detail,
    order: detail.order,
    viewModel: {
      ...detail.order,
      startReferenceAssets: [],
      buyerName: fixture?.buyerName ?? "고객",
      detailBuyerName: fixture?.detailBuyerName,
      detailPaymentText: fixture?.detailPaymentText,
      detailPickupText: fixture?.detailPickupText,
      detailRows,
      selectedRows: fixture?.selectedRows,
      storeName: fixture?.storeName ?? "스토어",
      thumbnailUrl: fixture?.thumbnailUrl ?? null,
    },
  };
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

function formatDateTime(value: string) {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(date);

  return `${datePart} ${formatTime(value)}`;
}

function formatOptionPrice(value: number) {
  if (value === 0) {
    return "+ 0원";
  }

  return `+ ${formatPrice(value)}`;
}

function parseOptionRows(value: string) {
  if (!value.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => {
        if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          return {
            label: String(record.label ?? record.name ?? `옵션 ${index + 1}`),
            price:
              typeof record.amount === "number"
                ? record.amount
                : typeof record.price === "number"
                  ? record.price
                  : null,
            value: String(record.value ?? record.answer ?? record.content ?? ""),
          };
        }

        return {
          label: `옵션 ${index + 1}`,
          price: null,
          value: String(item ?? ""),
        };
      });
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([label, optionValue]) => ({
        label,
        price: null,
        value: String(optionValue ?? ""),
      }));
    }
  } catch {
    return [{ label: "옵션", price: null, value }];
  }

  return [{ label: "옵션", price: null, value }];
}
