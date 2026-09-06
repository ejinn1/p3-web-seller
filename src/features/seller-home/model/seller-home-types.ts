export type SellerHomeOrderStatus =
  | "PICKUP_READY"
  | "INQUIRY_WAITING"
  | "PAYMENT_COMPLETE"
  | "REVISION_REQUESTED";

export type SellerHomePickup = {
  id: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerMaskedName: string;
  totalPrice: number;
  imageUrl: string;
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
