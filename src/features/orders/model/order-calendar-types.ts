import type {
  OrderOptionRow,
  OrderReferenceAsset,
  PaymentAttempt,
  Refund,
} from "@/features/orders/model/order-types";

export type OrderStatus =
  "PAID" | "PICKED_UP" | "REFUND_REQUESTED" | "REFUNDED";

export type OrderCalendarItem = {
  orderId: string;
  inquiryId: string;
  buyerUserId: string;
  orderNumber: string;
  menuName: string;
  startReferenceAssets?: string[];
  referenceAssets?: OrderReferenceAsset[];
  paidAmount: number;
  pickupAt: string;
  pickupDate: string;
  pickupTime: string;
  status: OrderStatus;
};

export type OrderCalendarDay = {
  date: string;
  orderCount: number;
  orders: OrderCalendarItem[];
};

export type OrderCalendarResponse = {
  startDate: string;
  endDate: string;
  status: OrderStatus | null;
  totalOrderCount: number;
  days: OrderCalendarDay[];
};

export type OrderResponse = {
  id: string;
  storeId: string;
  buyerUserId: string;
  inquiryId: string;
  confirmationId: string;
  orderNumber: string;
  menuName: string;
  optionSummary: string;
  startReferenceAssets?: string[];
  referenceAssets?: OrderReferenceAsset[];
  paidAmount: number;
  pickupAt: string;
  status: OrderStatus;
  refundRequestedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerOrderDetailResponse = {
  order: OrderResponse;
  paymentAttempt: PaymentAttempt | null;
  refunds: Refund[];
  optionRows: OrderOptionRow[];
};

export type OrderCalendarDisplayMeta = {
  buyerName: string;
  thumbnailUrl: string;
};

export type OrderCalendarOptionLine = {
  label: string;
  value: string;
  price: string;
};
