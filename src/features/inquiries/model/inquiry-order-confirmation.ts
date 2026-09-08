import type {
  InquiryOrderConfirmation,
  InquiryOrderOption,
  SendSellerOrderConfirmationAdditionalItem,
  SendSellerOrderConfirmationRequest,
} from "@/features/inquiries/model/inquiry-types";

export type InquiryOrderPriceCalculation = {
  additionalAmount: number;
  additionalItems: SendSellerOrderConfirmationAdditionalItem[];
  baseAmount: number;
  missingOptionIds: string[];
  totalAmount: number;
};

export function calculateInquiryOrderPrice(
  order: InquiryOrderConfirmation,
  priceDrafts: Record<string, number>,
): InquiryOrderPriceCalculation {
  const baseAmount = toValidAmount(order.basePrice) ?? 0;
  const missingOptionIds: string[] = [];
  const additionalItems = order.options.flatMap((option) => {
    if (!option.needsPrice) {
      return [];
    }

    const amount = toValidAmount(priceDrafts[option.id]);

    if (amount === null) {
      missingOptionIds.push(option.id);
      return [];
    }

    return [toAdditionalItem(option, amount)];
  });
  const additionalAmount = additionalItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return {
    additionalAmount,
    additionalItems,
    baseAmount,
    missingOptionIds,
    totalAmount: baseAmount + additionalAmount,
  };
}

export function applyPriceDrafts(
  order: InquiryOrderConfirmation,
  priceDrafts: Record<string, number>,
): InquiryOrderConfirmation {
  const calculation = calculateInquiryOrderPrice(order, priceDrafts);
  const options = order.options.map((option) => {
    const amount = toValidAmount(priceDrafts[option.id]);

    if (!option.needsPrice || amount === null) {
      return option;
    }

    return {
      ...option,
      amount,
      needsPrice: false,
      priceText: amount > 0 ? `+ ${formatInquiryPrice(amount)}` : "",
    };
  });

  return { ...order, options, totalPrice: calculation.totalAmount };
}

export function buildSendOrderConfirmationRequest(
  order: InquiryOrderConfirmation,
  priceDrafts: Record<string, number>,
): SendSellerOrderConfirmationRequest {
  if (!order.pickupAt) {
    throw new Error("픽업 일시가 없어 결제 요청을 보낼 수 없습니다.");
  }

  const calculation = calculateInquiryOrderPrice(order, priceDrafts);

  if (calculation.missingOptionIds.length > 0) {
    throw new Error("추가 옵션 금액을 모두 입력해주세요.");
  }

  if (calculation.totalAmount <= 0) {
    throw new Error("최종 결제 금액은 0원보다 커야 합니다.");
  }

  const summaryText =
    order.summaryText.trim() ||
    order.options
      .map((option) => `${option.label}: ${option.value}`)
      .join("\n");

  return {
    additionalItems: calculation.additionalItems,
    amount: calculation.totalAmount,
    confirmationTitle: order.confirmationTitle || "주문확인서",
    orderFormSubmissionId: order.orderFormSubmissionId,
    pickupAt: order.pickupAt,
    sellerNote: null,
    summaryText: summaryText || "주문확인서",
  };
}

export function parsePriceInput(value: string | undefined) {
  const normalized = value?.replace(/[,\s]/g, "") ?? "";

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return toValidAmount(Number(normalized));
}

export function formatInquiryPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function toAdditionalItem(
  option: InquiryOrderOption,
  amount: number,
): SendSellerOrderConfirmationAdditionalItem {
  return { amount, label: option.label, value: option.value };
}

function toValidAmount(value: number | undefined) {
  return Number.isSafeInteger(value) && value !== undefined && value >= 0
    ? value
    : null;
}
