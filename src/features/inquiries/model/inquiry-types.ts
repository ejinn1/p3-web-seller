export type InquiryStatus =
  "WAITING" | "IN_PROGRESS" | "PAID" | "PICKED_UP" | "TRASH";

export type InquiryTimelineItemType =
  | "MESSAGE"
  | "ORDER_FORM_SUBMISSION"
  | "ORDER_CONFIRMATION"
  | "ORDER_CONFIRMATION_REVISION"
  | "PAYMENT_COMPLETED";

export type InquiryParticipant = {
  userId: string;
  name: string;
  profileImageDeliveryUrl: string | null;
};

export type InquiryLatestEvent = {
  eventId: string;
  referenceId: string | null;
  type: InquiryTimelineItemType;
  senderUserId: string | null;
  content: string | null;
  createdAt: string;
};

export type InquiryLatestOrderFormSubmission = {
  submissionId: string;
  submittedAt: string;
};

export type InquiryListApiItem = {
  inquiryId: string;
  storeId: string;
  status: InquiryStatus;
  storeName: string;
  storeSlug: string;
  participant: InquiryParticipant;
  unreadCount: number;
  latestEventAt: string | null;
  latestEvent: InquiryLatestEvent | null;
  latestOrderFormSubmission: InquiryLatestOrderFormSubmission | null;
  myLastReadAt: string | null;
  createdAt: string;
};

export type InquiryChatDetailResponse = {
  inquiryId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  participant: InquiryParticipant;
  startReferenceAsset: {
    assetId: string;
    source: string;
    deliveryUrl: string | null;
  } | null;
  myLastReadAt: string | null;
  participantLastReadAt: string | null;
  createdAt: string;
};

export type InquiryTimelineItemResponse = {
  eventId: string;
  referenceId?: string | null;
  type: InquiryTimelineItemType;
  senderUserId: string | null;
  createdAt: string;
  content: string | null;
  assetIds: string[];
};

export type InquiryTimelinePageResponse = {
  items: InquiryTimelineItemResponse[];
  hasNext: boolean;
  nextCursorCreatedAt: string | null;
  nextCursorId: string | null;
};

export type InquiryOrderOptionRow = {
  label: string;
  value: string;
  amount: number | null;
  priceLabel?: string | null;
  required?: boolean;
};

export type InquiryReferenceAssetResponse = {
  assetId: string;
  source: string;
  sortOrder: number;
  status: string;
  deliveryUrl: string | null;
  variants: {
    type: string;
    deliveryUrl: string;
    width: number;
    height: number;
  }[];
};

export type InquiryOrderFormSubmissionResponse = {
  id: string;
  inquiryId: string;
  templateId: string;
  submittedBy: string;
  pickupDate: string;
  pickupTime: string;
  answers: string;
  referenceAssets: InquiryReferenceAssetResponse[];
  optionRows: InquiryOrderOptionRow[];
  cancellationRefundAgreed: boolean;
  submittedAt: string;
};

export type InquiryOrderConfirmationResponse = {
  confirmationId: string;
  inquiryId: string;
  orderFormSubmissionId: string;
  confirmationTitle: string;
  summaryText: string;
  amount: number;
  pickupAt: string;
  storeNameSnapshot: string;
  orderSummary: string;
  additionalItems: string;
  optionRows: InquiryOrderOptionRow[];
  sellerNote: string | null;
  status: string;
  sentAt: string | null;
  revisionRequestedAt?: string | null;
  buyerViewedAt?: string | null;
  replacedByConfirmationId?: string | null;
  createdAt: string;
};

export type SendSellerOrderConfirmationAdditionalItem = {
  label: string;
  value: string;
  amount: number;
};

export type SendSellerOrderConfirmationRequest = {
  orderFormSubmissionId: string | null;
  confirmationTitle: string;
  summaryText: string;
  amount: number;
  pickupAt: string;
  additionalItems: SendSellerOrderConfirmationAdditionalItem[];
  sellerNote: string | null;
};

export type SellerInquiryListParams = {
  status?: InquiryStatus;
  unreadOnly?: boolean;
};

export type InquiryListItem = {
  id: string;
  buyerName: string;
  hasOrderFormSubmission: boolean;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageTimeLabel: string;
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
  confirmationTitle: string;
  imageUrl: string | null;
  orderFormSubmissionId: string | null;
  options: InquiryOrderOption[];
  pickupAt: string | null;
  pickupDate: string;
  pickupTime: string;
  summaryText: string;
  totalPrice: number;
};

export type InquiryDetail = {
  createdAt: string;
  id: string;
  buyerName: string;
  chatInfo: string;
  participantUserId: string | null;
  profileImageUrl: string | null;
  status: InquiryStatus;
  statusLabel: string;
  messages: InquiryChatMessage[];
  order: InquiryOrderConfirmation;
};
