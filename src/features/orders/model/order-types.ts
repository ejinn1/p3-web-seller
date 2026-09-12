import type { AssetVariant } from "@/features/assets/model/asset-types";

export type SellerOrderStatus =
  "PAID" | "PICKED_UP" | "REFUND_REQUESTED" | "REFUNDED";

export type PaymentAttemptStatus =
  | "READY"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED"
  | "NEEDS_CONFIRMATION"
  | "CANCELED";

export type RefundStatus = "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type RefundOutcome =
  "COMPLETED" | "PROCESSING" | "RETRYABLE" | "MANUAL_REQUIRED" | "FAILED";
export type RefundCompletionMethod = "AUTOMATIC" | "MANUAL" | "ZERO_AMOUNT";

export type OrderListDateBasis = "PAID_AT" | "PICKUP_AT" | "CREATED_AT";

export type OrderReferenceAsset = {
  assetId: string;
  source: string | null;
  sortOrder: number;
  status: string;
  deliveryUrl: string | null;
  variants: AssetVariant[];
};

export type SellerOrderListParams = {
  dateBasis?: OrderListDateBasis;
  endDate?: string;
  startDate?: string;
  status?: SellerOrderStatus | SellerOrderStatus[];
};

export type SellerOrderListItem = {
  id: string;
  storeId: string;
  buyerUserId: string;
  inquiryId: string;
  confirmationId: string;
  orderNumber: string;
  menuName: string;
  optionSummary: string;
  startReferenceAssets: string[];
  referenceAssets?: OrderReferenceAsset[];
  paidAmount: number;
  pickupAt: string;
  status: SellerOrderStatus | null;
  refundRequestedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerOrder = Omit<SellerOrderListItem, "startReferenceAssets"> & {
  startReferenceAssets?: string[];
};

export type PaymentAttempt = {
  paymentAttemptId: string;
  confirmationId: string;
  sessionId: string;
  amount: number;
  status: PaymentAttemptStatus;
  failureCode: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
  expired: boolean;
};

export type Refund = {
  refundId: string;
  orderId: string;
  paymentAttemptId: string;
  requestedBy: string;
  amount: number;
  refundRate: number;
  reason: string | null;
  status: RefundStatus;
  outcome: RefundOutcome;
  retryable: boolean;
  providerRefundId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  failureDetails: string | null;
  createdAt: string;
  completedAt: string | null;
  completedBy: string | null;
  completionMethod: RefundCompletionMethod | null;
  failedAt: string | null;
};

export type OrderOptionRow = {
  amount: number | null;
  label: string;
  value: string;
};

export type SellerOrderDetail = {
  optionRows: OrderOptionRow[];
  order: SellerOrder;
  paymentAttempt: PaymentAttempt | null;
  refunds: Refund[];
};

export type SellerOrderOption = {
  assetPreviews?: Array<{
    assetId: string;
    deliveryUrl: string | null;
    status: string;
  }>;
  label: string;
  price: number | null;
  priceText?: string;
  value: string;
};

export type SellerOrderViewModel = SellerOrderListItem & {
  buyerName: string;
  detailBuyerName?: string;
  detailPaymentText?: string;
  detailPickupText?: string;
  detailRows: SellerOrderOption[];
  selectedRows?: SellerOrderOption[];
  storeName: string;
  thumbnailUrl: string | null;
};
