import type {
  RevenueCancelHistory,
  RevenueOrderLine,
  RevenueSummarySection,
  SellerRevenueResponse,
} from "@/features/revenue/model/revenue-types";

export const revenueFixture: SellerRevenueResponse = {
  startDate: "2026-08-12",
  endDate: "2026-08-12",
  paymentRevenueAmount: 759497,
  completedRefundAmount: 120800,
  netSalesAmount: 638697,
  settlementFeeRateBasisPoints: 30,
  settlementFeeAmount: 1916,
  settlementEstimateAmount: 636781,
};

export const revenueSummarySections: RevenueSummarySection[] = [
  {
    id: "sales",
    view: "payments",
    primary: { label: "실 매출", value: 638697, unit: "원" },
    secondary: [
      { label: "평균 결제 금액", value: 63869, unit: "원" },
      { label: "결제 건수", value: 10, unit: "건" },
    ],
  },
  {
    id: "discounts",
    view: "discounts",
    primary: { label: "할인 금액", value: 5000, unit: "원", tone: "muted" },
    secondary: [
      { label: "평균 결제 금액", value: 6000, unit: "원", tone: "muted" },
      { label: "할인 건수", value: 1, unit: "건", tone: "muted" },
    ],
  },
  {
    id: "cancellations",
    view: "cancellations",
    primary: {
      label: "취소 금액",
      value: 120800,
      unit: "원",
      tone: "danger",
    },
    secondary: [
      {
        label: "평균 취소 금액",
        value: 64000,
        unit: "원",
        tone: "danger",
      },
      { label: "취소 건수", value: 2, unit: "건", tone: "danger" },
    ],
  },
];

export const revenuePaymentLines: RevenueOrderLine[] = [
  {
    id: "payment-1",
    timeLabel: "오후 02:00",
    pickupLabel: "8월 19일",
    customerName: "김지현",
    amount: 64000,
    imageSrc: "/revenue/cake-flower.png",
  },
  {
    id: "payment-2",
    timeLabel: "오후 03:30",
    pickupLabel: "8월 19일",
    customerName: "박서연",
    amount: 71500,
    imageSrc: "/revenue/cake-berries-alt.png",
  },
  {
    id: "payment-3",
    timeLabel: "오후 06:00",
    pickupLabel: "8월 19일",
    customerName: "이도현",
    amount: 54000,
    imageSrc: "/revenue/cake-box.png",
  },
  {
    id: "payment-4",
    timeLabel: "오후 02:00",
    pickupLabel: "8월 19일",
    customerName: "김지현",
    amount: 64000,
    imageSrc: "/revenue/cake-flower.png",
  },
  {
    id: "payment-5",
    timeLabel: "오후 03:30",
    pickupLabel: "8월 19일",
    customerName: "박서연",
    amount: 71500,
    imageSrc: "/revenue/cake-berries-alt.png",
  },
  {
    id: "payment-6",
    timeLabel: "오후 06:00",
    pickupLabel: "8월 19일",
    customerName: "이도현",
    amount: 54000,
    imageSrc: "/revenue/cake-box.png",
  },
];

export const revenueDiscountLines: RevenueOrderLine[] = [
  {
    id: "discount-1",
    timeLabel: "오후 03:30",
    pickupLabel: "8월 19일",
    customerName: "박서연",
    amount: 71500,
    imageSrc: "/revenue/cake-berries-alt.png",
  },
];

export const revenueCancellationLines: RevenueOrderLine[] = [
  {
    id: "cancel-1",
    timeLabel: "오후 03:30",
    pickupLabel: "8월 19일",
    customerName: "박서연",
    amount: 71500,
    imageSrc: "/revenue/cake-berries-alt.png",
  },
  {
    id: "cancel-2",
    timeLabel: "오후 03:30",
    pickupLabel: "8월 19일",
    customerName: "박서연",
    amount: 71500,
    imageSrc: "/revenue/cake-berries-alt.png",
  },
];

export const revenueCancelHistory: RevenueCancelHistory = {
  id: "cancel-1",
  paymentDateTimeLabel: "2026년 8월 17일 오후 03:12",
  pickupDateTimeLabel: "2026년 8월 19일 오후 3시00",
  customerName: "이동후",
  storeName: "위하다",
  statusLabel: "취소완료",
  totalAmount: 64000,
  options: [
    {
      id: "design",
      label: "디자인",
      value: "2호 (18cm/높이 7cm)",
      priceLabel: "+ 45,000원 ~",
    },
    { id: "shape", label: "모양", value: "사각", priceLabel: "+ 3,000원" },
    {
      id: "flavor",
      label: "케이크 맛",
      value: "초코시트 + 생크림",
      priceLabel: "+ 3,000원",
    },
    {
      id: "packaging",
      label: "포장 방식",
      value: "보닝백 포장",
      priceLabel: "+ 4,000원",
    },
    {
      id: "request",
      label: "기타 요청사항",
      value: "이렇게 만들어주세요",
      priceLabel: "+ 12,000원",
    },
  ],
};
