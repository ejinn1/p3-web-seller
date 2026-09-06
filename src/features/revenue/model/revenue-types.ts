export type SellerRevenueResponse = {
  startDate: string;
  endDate: string;
  paymentRevenueAmount: number;
  completedRefundAmount: number;
  netSalesAmount: number;
  settlementFeeRateBasisPoints: number;
  settlementFeeAmount: number;
  settlementEstimateAmount: number;
};

export type RevenuePeriod = "today" | "week" | "month" | "sixMonths" | "custom";

export type RevenueView =
  | "home"
  | "payments"
  | "discounts"
  | "cancellations"
  | "cancel-history";

export type RevenueSummaryMetric = {
  label: string;
  value: number;
  unit: "원" | "건";
  tone?: "default" | "muted" | "danger";
};

export type RevenueSummarySection = {
  id: "sales" | "discounts" | "cancellations";
  primary: RevenueSummaryMetric;
  secondary: [RevenueSummaryMetric, RevenueSummaryMetric];
  view: RevenueView;
};

export type RevenueOrderLine = {
  id: string;
  timeLabel: string;
  pickupLabel: string;
  customerName: string;
  amount: number;
  imageSrc: string;
};

export type RevenueCancelHistory = {
  id: string;
  paymentDateTimeLabel: string;
  pickupDateTimeLabel: string;
  customerName: string;
  storeName: string;
  statusLabel: string;
  totalAmount: number;
  options: {
    id: string;
    label: string;
    value: string;
    priceLabel: string;
  }[];
};
