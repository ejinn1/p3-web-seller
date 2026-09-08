import type {
  InquiryOrderConfirmation,
  SendSellerOrderConfirmationRequest,
} from "@/features/inquiries/model/inquiry-types";

export function applyPriceDrafts(
  order: InquiryOrderConfirmation,
  priceDrafts: Record<string, number>,
): InquiryOrderConfirmation {
  let additionalAmount = 0;
  const options = order.options.map((option) => {
    const amount = priceDrafts[option.id];

    if (!option.needsPrice || !Number.isFinite(amount)) {
      return option;
    }

    additionalAmount += amount;

    return {
      ...option,
      needsPrice: false,
      priceText: amount > 0 ? `+ ${formatInquiryPrice(amount)}` : "",
    };
  });

  return { ...order, options, totalPrice: order.totalPrice + additionalAmount };
}

export function buildSendOrderConfirmationRequest(
  order: InquiryOrderConfirmation,
  priceDrafts: Record<string, number>,
): SendSellerOrderConfirmationRequest {
  if (!order.pickupAt) {
    throw new Error("픽업 일시가 없어 결제 요청을 보낼 수 없습니다.");
  }

  const additionalItems = order.options
    .filter((option) => option.needsPrice)
    .flatMap((option) => {
      const amount = priceDrafts[option.id];

      return Number.isFinite(amount)
        ? [{ amount, label: option.label, value: option.value }]
        : [];
    });
  const additionalAmount = additionalItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const summaryText =
    order.summaryText.trim() ||
    order.options
      .map((option) => `${option.label}: ${option.value}`)
      .join("\n");

  return {
    additionalItems,
    amount: order.totalPrice + additionalAmount,
    confirmationTitle: order.confirmationTitle || "주문확인서",
    orderFormSubmissionId: order.orderFormSubmissionId,
    pickupAt: order.pickupAt,
    sellerNote: null,
    summaryText: summaryText || "주문확인서",
  };
}

export function parsePriceInput(value: string | undefined) {
  const normalized = value?.replace(/[,\s]/g, "") ?? "";

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function formatInquiryPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
