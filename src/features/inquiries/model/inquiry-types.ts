export type InquiryStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "PAYMENT_REQUESTED"
  | "PAID"
  | "PICKED_UP"
  | "TRASHED";

export type InquiryListItem = {
  id: string;
  buyerName: string;
  lastMessage: string;
  lastMessageAt: string;
  status: InquiryStatus;
  unreadCount: number;
  profileImageUrl: string | null;
};

export type InquiryChatMessage =
  | {
      id: string;
      kind: "order-request";
      owner: "buyer";
      sentAt: string;
    }
  | {
      id: string;
      kind: "text";
      owner: "buyer" | "seller";
      sentAt: string;
      text: string;
      unreadCount?: number;
    }
  | {
      id: string;
      kind: "payment-request";
      owner: "seller";
      sentAt: string;
      amount: number;
    }
  | {
      id: string;
      kind: "payment-complete";
      owner: "buyer";
      sentAt: string;
      amount: number;
    }
  | {
      id: string;
      kind: "notice";
      text: string;
    };

export type InquiryOrderOption = {
  id: string;
  label: string;
  value: string;
  priceText: string;
  required?: boolean;
  needsPrice?: boolean;
};

export type InquiryOrderConfirmation = {
  buyerName: string;
  buyerPhone: string;
  imageUrl: string | null;
  options: InquiryOrderOption[];
  pickupDate: string;
  pickupTime: string;
  totalPrice: number;
};

export type InquiryDetail = {
  id: string;
  buyerName: string;
  chatInfo: string;
  status: InquiryStatus;
  statusLabel: string;
  messages: InquiryChatMessage[];
  order: InquiryOrderConfirmation;
};
