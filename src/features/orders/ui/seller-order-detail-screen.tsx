"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/button";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { useAssetQueries } from "@/features/assets/model/asset-queries";
import type { Asset } from "@/features/assets/model/asset-types";
import { getInquiryOrderOptionRows } from "@/features/inquiries/model/inquiry-adapters";
import type {
  InquiryChatDetailResponse,
  InquiryOrderConfirmationResponse,
  InquiryOrderFormSubmissionResponse,
  InquiryReferenceAssetResponse,
} from "@/features/inquiries/model/inquiry-types";
import {
  useCompleteSellerOrderPickupMutation,
  useRefundSellerOrderMutation,
} from "@/features/orders/model/order-mutations";
import {
  useSellerOrderConfirmationQuery,
  useSellerOrderInquiryQuery,
  useSellerOrderQuery,
  useSellerOrderSubmissionQuery,
} from "@/features/orders/model/order-queries";
import {
  getReferenceAssetIds,
  getReferenceThumbnailUrl,
} from "@/features/orders/model/order-reference-assets";
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
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function SellerOrderDetailScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSelectedView = searchParams.get("view") === "selected";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const query = useSellerOrderQuery(orderId);
  const pickupMutation = useCompleteSellerOrderPickupMutation(orderId);
  const refundMutation = useRefundSellerOrderMutation(orderId);
  const referenceAssetIds = useMemo(
    () => getReferenceAssetIds(query.data?.order.startReferenceAssets ?? []),
    [query.data?.order.startReferenceAssets],
  );
  const referenceAssetQueries = useAssetQueries(referenceAssetIds);
  const order = query.data?.order ?? null;
  const inquiryQuery = useSellerOrderInquiryQuery(order?.inquiryId ?? null);
  const confirmationQuery = useSellerOrderConfirmationQuery(
    order?.inquiryId ?? null,
    order?.confirmationId ?? null,
  );
  const submissionId = confirmationQuery.data?.orderFormSubmissionId ?? null;
  const submissionQuery = useSellerOrderSubmissionQuery(
    order?.inquiryId ?? null,
    submissionId,
  );
  const referenceAssetById = new Map(
    referenceAssetQueries.flatMap((assetQuery) =>
      assetQuery.data ? [[assetQuery.data.id, assetQuery.data] as const] : [],
    ),
  );
  const view = query.data
    ? toDetailView(query.data, referenceAssetById, {
        confirmation: confirmationQuery.data,
        inquiry: inquiryQuery.data,
        submission: submissionQuery.data,
      })
    : null;
  const isLoading = query.isLoading;
  const isError = query.isError;

  return (
    <SellerResponsiveFrame className="bg-surface-subtle">
      <OrdersHeader
        backHref={getSellerBackHref("orderDetail")}
        onMenu={() => setSidebarOpen(true)}
        showMenu
        title="주문 내역"
      />
      <section className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-4 pb-[34px]">
        {isLoading ? (
          <DetailState message="주문 상세를 불러오고 있어요." />
        ) : null}
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
      {isSelectedView &&
      !isLoading &&
      !isError &&
      view?.order.status === "PAID" ? (
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
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function OrderDetailCard({
  selected,
  view,
}: {
  selected: boolean;
  view: DetailView;
}) {
  const paymentDate =
    view.detail.paymentAttempt?.completedAt ?? view.order.createdAt;
  const rows =
    selected && view.viewModel.selectedRows
      ? view.viewModel.selectedRows
      : view.viewModel.detailRows;
  const hasOptionAssets = rows.some((row) => row.assetPreviews?.length);

  return (
    <article
      className="flex w-full flex-col gap-8 overflow-hidden rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
      data-qa="orders-detail-card"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 whitespace-nowrap">
          <InfoRow
            label="결제일시"
            value={
              view.viewModel.detailPaymentText ?? formatDateTime(paymentDate)
            }
          />
          <InfoRow
            label="픽업일시"
            value={
              view.viewModel.detailPickupText ??
              formatDateTime(view.order.pickupAt)
            }
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
        {view.viewModel.thumbnailUrl && !hasOptionAssets ? (
          <div className="size-[96px] overflow-hidden rounded-seller-sm bg-surface-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="주문 참조 이미지"
              className="size-full object-cover"
              src={view.viewModel.thumbnailUrl}
            />
          </div>
        ) : null}
      </div>
      <div className="h-px w-full bg-surface-subtle opacity-90" />
      <div className="flex flex-col gap-6">
        {rows.map((row) => (
          <div
            className="flex flex-col gap-2"
            data-qa="orders-detail-row"
            key={row.label}
          >
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
            <OrderOptionAssetPreviewList assets={row.assetPreviews} />
          </div>
        ))}
      </div>
    </article>
  );
}

function OrderOptionAssetPreviewList({
  assets,
}: {
  assets?: SellerOrderViewModel["detailRows"][number]["assetPreviews"];
}) {
  if (!assets?.length) {
    return null;
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      data-qa="orders-detail-option-assets"
    >
      {assets.map((asset, index) => (
        <div
          className="size-16 shrink-0 overflow-hidden rounded-seller-sm bg-surface-subtle"
          key={`${asset.assetId}-${index}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="첨부 이미지 미리보기"
            className="size-full object-cover"
            src={asset.deliveryUrl}
          />
        </div>
      ))}
    </div>
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

function toDetailView(
  detail: SellerOrderDetail,
  referenceAssetById: Map<string, Asset>,
  relations: {
    confirmation?: InquiryOrderConfirmationResponse | null;
    inquiry?: InquiryChatDetailResponse | null;
    submission?: InquiryOrderFormSubmissionResponse | null;
  } = {},
): DetailView {
  const startReferenceAssets = detail.order.startReferenceAssets ?? [];
  const detailRows = buildDetailRows(detail, relations);
  const buyerName = relations.inquiry?.participant.name ?? "고객";
  const storeName =
    relations.confirmation?.storeNameSnapshot ??
    relations.inquiry?.storeName ??
    "스토어";

  return {
    detail,
    order: detail.order,
    viewModel: {
      ...detail.order,
      startReferenceAssets,
      buyerName,
      detailBuyerName: buyerName,
      detailRows,
      selectedRows: detailRows,
      storeName,
      thumbnailUrl: getReferenceThumbnailUrl(
        startReferenceAssets,
        referenceAssetById,
        detail.order.referenceAssets,
      ),
    },
  };
}

function buildDetailRows(
  detail: SellerOrderDetail,
  relations: {
    confirmation?: InquiryOrderConfirmationResponse | null;
    submission?: InquiryOrderFormSubmissionResponse | null;
  },
) {
  const referenceAssetsById = new Map<string, InquiryReferenceAssetResponse>(
    (relations.submission?.referenceAssets ?? []).map((asset) => [
      asset.assetId,
      asset,
    ]),
  );
  const hydratedRows = getInquiryOrderOptionRows(
    relations.confirmation?.optionRows,
    relations.confirmation?.summaryText,
    relations.submission?.optionRows,
    relations.submission?.answers,
    relations.confirmation?.additionalItems,
    referenceAssetsById,
  );

  if (hydratedRows.length > 0) {
    return hydratedRows.map((row) => ({
      assetPreviews: row.assetPreviews,
      label: row.label,
      price: row.amount,
      priceText: row.priceLabel ?? undefined,
      value: row.value,
    }));
  }

  return detail.optionRows.length > 0
    ? detail.optionRows.map((row) => ({
        label: row.label,
        price: row.amount,
        value: row.value,
      }))
    : parseOptionRows(detail.order.optionSummary);
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
            value: String(
              record.value ?? record.answer ?? record.content ?? "",
            ),
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
