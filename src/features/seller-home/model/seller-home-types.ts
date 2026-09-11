export type SellerHomeOrderStatus =
  | "PICKUP_READY"
  | "INQUIRY_WAITING"
  | "PAYMENT_COMPLETE"
  | "REVISION_REQUESTED"
  | "REFUND_REQUESTED"
  | "REFUNDED";

export type SellerDashboardOrderStatus =
  "PAID" | "PICKED_UP" | "REFUND_REQUESTED" | "REFUNDED";

export type SellerDashboardTodayOrder = {
  orderId: string;
  inquiryId: string;
  buyerUserId: string;
  orderNumber: string;
  menuName: string;
  paidAmount: number;
  pickupAt: string;
  pickupDate: string;
  pickupTime: string;
  status: SellerDashboardOrderStatus;
};

export type SellerDashboardResponse = {
  today: string;
  weekStartDate: string;
  weekEndDate: string;
  currentMonthRevenue: {
    startDate: string;
    endDate: string;
    paymentRevenueAmount: number;
    completedRefundAmount: number;
    netSalesAmount: number;
    settlementFeeRateBasisPoints: number;
    settlementFeeAmount: number;
    settlementEstimateAmount: number;
  };
  todayOrderCount: number;
  thisWeekOrderCount: number;
  paidOrderCount: number;
  cancelRefundRequestCount: number;
  unansweredInquiryCount: number;
  todayOrders: SellerDashboardTodayOrder[];
};

export type SellerHomePickup = {
  id: string;
  inquiryId: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerMaskedName: string;
  totalPrice: number;
  imageUrl: string | null;
  status: SellerHomeOrderStatus;
};

export type SellerHomeInquiry = {
  id: string;
  customerMaskedName: string;
  previewMessage: string;
  sentAt: string;
  unreadCount: number;
  hasOrderForm: boolean;
};

export type SellerHomeOrderFormItem = {
  id: string;
  label: string;
  value: string;
  priceLabel?: string;
  required?: boolean;
};

export type SellerHomeOrderForm = {
  customerName: string;
  customerPhone: string;
  pickupDateLabel: string;
  pickupTimeLabel: string;
  items: SellerHomeOrderFormItem[];
  totalPrice: number;
};

export type SellerHomeDashboard = {
  dateLabel: string;
  weekDays: string[];
  dateCells: Array<{
    date: string;
    label: string;
    disabled?: boolean;
    selected?: boolean;
  }>;
  todayPickupCount: number;
  waitingInquiryCount: number;
  pickups: SellerHomePickup[];
  inquiries: SellerHomeInquiry[];
  orderForm: SellerHomeOrderForm;
  chat: {
    storeName: string;
    info: string;
    statusLabel: string;
    dateLabel: string;
  };
};
