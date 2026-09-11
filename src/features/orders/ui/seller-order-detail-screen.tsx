"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/button";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";
import { getInquiryOrderOptionRows } from "@/features/inquiries/model/inquiry-adapters";
import type {
  InquiryChatDetailResponse,
  InquiryOrderConfirmationResponse,
  InquiryOrderFormSubmissionResponse,
  InquiryReferenceAssetResponse,
} from "@/features/inquiries/model/inquiry-types";
import {
  useCompleteSellerOrderPickupMutation,
  useRefreshSellerOrderRefundMutation,
  useRefundSellerOrderMutation,
} from "@/features/orders/model/order-mutations";
import {
  getSellerRefundUiState,
  type SellerRefundUiState,
} from "@/features/orders/model/refund-ui-state";
import {
  useSellerOrderConfirmationQuery,
  useSellerOrderInquiryQuery,
  useSellerOrderQuery,
  useSellerOrderSubmissionQuery,
} from "@/features/orders/model/order-queries";
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
import {
  getSellerBackHref,
  SELLER_HOME_ROUTE,
} from "@/lib/navigation/seller-back-routes";

export function SellerOrderDetailScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSelectedView = searchParams.get("view") === "selected";
  const isConfirmationView = searchParams.get("view") === "confirmation";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const query = useSellerOrderQuery(orderId);
  const pickupMutation = useCompleteSellerOrderPickupMutation(orderId);
  const refundMutation = useRefundSellerOrderMutation(orderId);
  const refreshRefundMutation = useRefreshSellerOrderRefundMutation(orderId);
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
  const view = query.data
    ? toDetailView(query.data, {
        confirmation: confirmationQuery.data,
        inquiry: inquiryQuery.data,
        submission: submissionQuery.data,
      })
    : null;
  const isRelatedLoading =
    isConfirmationView &&
    Boolean(query.data) &&
    (inquiryQuery.isLoading ||
      confirmationQuery.isLoading ||
      (Boolean(submissionId) && submissionQuery.isLoading));
  const relatedError =
    inquiryQuery.error ?? confirmationQuery.error ?? submissionQuery.error;
  const isLoading = query.isLoading || isRelatedLoading;
  const isError =
    query.isError ||
    (isConfirmationView &&
      (inquiryQuery.isError ||
        confirmationQuery.isError ||
        submissionQuery.isError));
  const refundState = query.data ? getSellerRefundUiState(query.data) : null;
  const refundActionError = refundMutation.error ?? refreshRefundMutation.error;

  return (
    <SellerResponsiveFrame className="bg-surface-subtle">
      <OrdersHeader
        backHref={
          isConfirmationView
            ? SELLER_HOME_ROUTE
            : getSellerBackHref("orderDetail")
        }
        onMenu={() => setSidebarOpen(true)}
        showMenu={!isConfirmationView}
        title={isConfirmationView ? "주문확인서" : "주문 내역"}
      />
      <section
        className={`flex flex-1 flex-col overflow-y-auto px-4 pb-[34px] ${
          isConfirmationView ? "gap-4 pt-6" : "gap-8 pt-4"
        }`}
      >
        {isLoading ? (
          <DetailState message="주문 상세를 불러오고 있어요." />
        ) : null}
        {isError ? (
          <DetailState
            message={
              query.error instanceof Error
                ? query.error.message
                : relatedError instanceof Error
                  ? relatedError.message
                  : "주문 상세를 불러오지 못했습니다."
            }
          />
        ) : null}
        {!isLoading && !isError && !view ? (
          <DetailState message="주문 상세 정보가 없습니다." />
        ) : null}
        {!isLoading && !isError && view && isConfirmationView ? (
          <>
            <OrderConfirmationCard view={view} />
            <Button
              className="h-[52px] w-full rounded-seller-md bg-brand-disabled text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-inverse disabled:opacity-100"
              disabled
            >
              결제 완료
            </Button>
          </>
        ) : null}
        {!isLoading && !isError && view && !isConfirmationView ? (
          <>
            <OrderDetailCard selected={isSelectedView} view={view} />
            {refundState?.message ? (
              <RefundStatusNotice state={refundState} />
            ) : null}
          </>
        ) : null}
      </section>
      {!isConfirmationView && !isLoading && !isError && refundState ? (
        <SellerOrderActions
          error={refundActionError}
          onPickup={() => {
            pickupMutation.mutate(undefined, {
              onSuccess: () => router.push(`/seller/orders/${orderId}`),
            });
          }}
          onRefund={() => refundMutation.mutate(undefined)}
          onRefresh={() => refreshRefundMutation.mutate()}
          pending={
            pickupMutation.isPending ||
            refundMutation.isPending ||
            refreshRefundMutation.isPending
          }
          state={refundState}
        />
      ) : null}
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </SellerResponsiveFrame>
  );
}

function SellerOrderActions({
  error,
  onPickup,
  onRefund,
  onRefresh,
  pending,
  state,
}: {
  error: Error | null;
  onPickup: () => void;
  onRefund: () => void;
  onRefresh: () => void;
  pending: boolean;
  state: SellerRefundUiState;
}) {
  if (!state.action && !state.showPickupAction) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 bg-surface-subtle px-4 pt-4 pb-[34px]">
      <div className="flex gap-2">
        {state.action ? (
          <Button
            className="h-11 flex-1 rounded-seller-md border-border-default text-[15px] leading-5 font-semibold tracking-[-0.3px] !text-text-secondary"
            data-qa={
              state.action === "REFRESH"
                ? "orders-refund-refresh-button"
                : "orders-refund-button"
            }
            disabled={pending}
            onClick={state.action === "REFRESH" ? onRefresh : onRefund}
            variant="outline"
          >
            {pending ? "처리 중" : state.actionLabel}
          </Button>
        ) : null}
        {state.showPickupAction ? (
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            data-qa="orders-pickup-button"
            disabled={pending}
            onClick={onPickup}
          >
            픽업 완료
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="text-center text-[13px] leading-[18px] text-text-error">
          {error.message || "환불 요청을 처리하지 못했습니다."}
        </p>
      ) : null}
    </div>
  );
}

function RefundStatusNotice({ state }: { state: SellerRefundUiState }) {
  const requiresAttention =
    state.kind === "MANUAL_REQUIRED" || state.kind === "FAILED";

  return (
    <section
      className={`rounded-seller-sm border px-4 py-3 text-[13px] leading-[18px] ${
        requiresAttention
          ? "border-status-error text-text-error"
          : "border-border-default bg-surface-default text-text-secondary"
      }`}
      data-qa="orders-refund-status"
    >
      {state.message}
    </section>
  );
}

function OrderConfirmationCard({ view }: { view: DetailView }) {
  const pickupAt = view.confirmation?.pickupAt ?? view.order.pickupAt;
  const rows = view.viewModel.selectedRows ?? view.viewModel.detailRows;

  return (
    <article className="flex w-full flex-col gap-8 overflow-hidden rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex w-full items-start justify-between text-seller-display-sm leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        <p>{formatConfirmationDate(pickupAt)}</p>
        <p>{formatTime(pickupAt)}</p>
      </div>
      <div className="flex flex-col gap-1">
        <ConfirmationInfoRow
          label="주문자"
          value={view.inquiry?.participant.name ?? view.viewModel.buyerName}
        />
        <ConfirmationInfoRow
          label="연락처"
          value={view.inquiry?.participant.phoneNumber ?? "-"}
        />
      </div>
      <div className="h-px w-full bg-surface-subtle opacity-90" />
      <div className="flex flex-col gap-6">
        {rows.map((row) => (
          <div className="flex w-full flex-col gap-2" key={row.label}>
            <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
              {row.label}
            </p>
            <div className="flex w-full items-start justify-between gap-3">
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
      <div className="h-px w-full bg-surface-subtle opacity-90" />
      <div className="flex items-start justify-between text-seller-display-sm leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        <p>최종 가격</p>
        <p>{formatPrice(view.confirmation?.amount ?? view.order.paidAmount)}</p>
      </div>
    </article>
  );
}

function ConfirmationInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {value}
      </p>
    </div>
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
          className="size-[100px] shrink-0 overflow-hidden rounded-seller-sm bg-surface-subtle"
          key={`${asset.assetId}-${index}`}
        >
          {asset.deliveryUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="첨부 이미지 미리보기"
              className="size-full object-cover"
              src={asset.deliveryUrl}
            />
          ) : (
            <span className="flex size-full items-center justify-center px-2 text-center text-[11px] leading-4 text-text-tertiary">
              {["PROCESSING", "UPLOADED"].includes(asset.status)
                ? "이미지 처리 중"
                : "이미지를 불러올 수 없어요"}
            </span>
          )}
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
  confirmation: InquiryOrderConfirmationResponse | null;
  detail: SellerOrderDetail;
  inquiry: InquiryChatDetailResponse | null;
  order: SellerOrderDetail["order"];
  viewModel: SellerOrderViewModel;
};

function toDetailView(
  detail: SellerOrderDetail,
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
    confirmation: relations.confirmation ?? null,
    detail,
    inquiry: relations.inquiry ?? null,
    order: detail.order,
    viewModel: {
      ...detail.order,
      startReferenceAssets,
      buyerName,
      detailBuyerName: buyerName,
      detailRows,
      selectedRows: detailRows,
      storeName,
      thumbnailUrl: null,
    },
  };
}

function formatConfirmationDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    weekday: "long",
  }).format(new Date(value));
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
