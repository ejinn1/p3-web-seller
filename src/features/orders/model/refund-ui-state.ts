import type {
  Refund,
  SellerOrderDetail,
} from "@/features/orders/model/order-types";

export type SellerRefundAction =
  "REFUND" | "REFRESH" | "MANUAL_COMPLETE" | null;

export type SellerRefundUiState = {
  action: SellerRefundAction;
  actionLabel: string | null;
  actionRefundId: string | null;
  kind:
    | "AVAILABLE"
    | "REQUESTED"
    | "PROCESSING"
    | "RETRYABLE"
    | "MANUAL_REQUIRED"
    | "FAILED"
    | "COMPLETED"
    | "UNAVAILABLE";
  message: string | null;
  showCompletedAction: boolean;
  showPickupAction: boolean;
};

export function getLatestRefund(refunds: Refund[]) {
  return refunds[0] ?? null;
}

export function getSellerRefundUiState(
  detail: SellerOrderDetail,
): SellerRefundUiState {
  const latestRefund = getLatestRefund(detail.refunds);
  const manualRequiredRefunds = detail.refunds.filter(
    (refund) =>
      refund.status === "FAILED" && refund.outcome === "MANUAL_REQUIRED",
  );

  if (detail.order.status === "REFUNDED") {
    return {
      action: null,
      actionLabel: null,
      actionRefundId: null,
      kind: "COMPLETED",
      message: "환불이 완료되었습니다.",
      showCompletedAction: true,
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "PROCESSING") {
    return {
      action: "REFRESH",
      actionLabel: "상태 확인",
      actionRefundId: null,
      kind: "PROCESSING",
      message: "환불 처리 결과를 확인 중입니다.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "RETRYABLE") {
    return {
      action: "REFUND",
      actionLabel: "환불 재시도",
      actionRefundId: null,
      kind: "RETRYABLE",
      message: "현재 환불 처리 제한 시간입니다. 잠시 후 다시 시도해 주세요.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  if (
    detail.order.status === "REFUND_REQUESTED" &&
    manualRequiredRefunds.length > 1
  ) {
    return {
      action: null,
      actionLabel: null,
      actionRefundId: null,
      kind: "FAILED",
      message: "수동 환불 대상을 정확히 특정하지 못했습니다.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  const manualRequiredRefund = manualRequiredRefunds[0] ?? null;

  if (
    detail.order.status === "REFUND_REQUESTED" &&
    manualRequiredRefund !== null
  ) {
    return {
      action: "MANUAL_COMPLETE",
      actionLabel: "환불 완료",
      actionRefundId: manualRequiredRefund.refundId,
      kind: "MANUAL_REQUIRED",
      message: "자동 환불 가능 기간이 지나 수동 환불이 필요합니다.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "FAILED") {
    return {
      action: latestRefund.retryable ? "REFUND" : null,
      actionLabel: latestRefund.retryable ? "환불 재시도" : null,
      actionRefundId: null,
      kind: "FAILED",
      message: latestRefund.retryable
        ? "환불 처리에 실패했습니다. 다시 시도해 주세요."
        : "자동 환불에 실패했습니다. 관리자 확인이 필요합니다.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  if (detail.order.status === "REFUND_REQUESTED") {
    return {
      action: "REFUND",
      actionLabel: "환불처리",
      actionRefundId: null,
      kind: "REQUESTED",
      message: "구매자가 환불을 요청했습니다. 환불 처리가 필요합니다.",
      showCompletedAction: false,
      showPickupAction: false,
    };
  }

  if (detail.order.status === "PAID") {
    return {
      action: null,
      actionLabel: null,
      actionRefundId: null,
      kind: "AVAILABLE",
      message: null,
      showCompletedAction: false,
      showPickupAction: true,
    };
  }

  return {
    action: null,
    actionLabel: null,
    actionRefundId: null,
    kind: "UNAVAILABLE",
    message: null,
    showCompletedAction: false,
    showPickupAction: false,
  };
}
