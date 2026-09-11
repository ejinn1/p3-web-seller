import type {
  Refund,
  SellerOrderDetail,
} from "@/features/orders/model/order-types";

export type SellerRefundAction = "REFUND" | "REFRESH" | null;

export type SellerRefundUiState = {
  action: SellerRefundAction;
  actionLabel: string | null;
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
  showPickupAction: boolean;
};

export function getLatestRefund(refunds: Refund[]) {
  return refunds[0] ?? null;
}

export function getSellerRefundUiState(
  detail: SellerOrderDetail,
): SellerRefundUiState {
  const latestRefund = getLatestRefund(detail.refunds);

  if (detail.order.status === "REFUNDED") {
    return {
      action: null,
      actionLabel: null,
      kind: "COMPLETED",
      message: "환불이 완료되었습니다.",
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "PROCESSING") {
    return {
      action: "REFRESH",
      actionLabel: "상태 확인",
      kind: "PROCESSING",
      message: "환불 처리 결과를 확인 중입니다.",
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "RETRYABLE") {
    return {
      action: "REFUND",
      actionLabel: "환불 재시도",
      kind: "RETRYABLE",
      message: "현재 환불 처리 제한 시간입니다. 잠시 후 다시 시도해 주세요.",
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "MANUAL_REQUIRED") {
    return {
      action: null,
      actionLabel: null,
      kind: "MANUAL_REQUIRED",
      message: "자동 환불 가능 기간이 지나 수동 환불이 필요합니다.",
      showPickupAction: false,
    };
  }

  if (latestRefund?.outcome === "FAILED") {
    return {
      action: latestRefund.retryable ? "REFUND" : null,
      actionLabel: latestRefund.retryable ? "환불 재시도" : null,
      kind: "FAILED",
      message: latestRefund.retryable
        ? "환불 처리에 실패했습니다. 다시 시도해 주세요."
        : "자동 환불에 실패했습니다. 관리자 확인이 필요합니다.",
      showPickupAction: false,
    };
  }

  if (detail.order.status === "REFUND_REQUESTED") {
    return {
      action: "REFUND",
      actionLabel: "환불처리",
      kind: "REQUESTED",
      message: "구매자가 환불을 요청했습니다. 환불 처리가 필요합니다.",
      showPickupAction: false,
    };
  }

  if (detail.order.status === "PAID") {
    return {
      action: null,
      actionLabel: null,
      kind: "AVAILABLE",
      message: null,
      showPickupAction: true,
    };
  }

  return {
    action: null,
    actionLabel: null,
    kind: "UNAVAILABLE",
    message: null,
    showPickupAction: false,
  };
}
