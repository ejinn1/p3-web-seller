import type { AssetVariant } from "@/features/assets/model/asset-types";

export type InquiryStatus =
  "WAITING" | "IN_PROGRESS" | "PAID" | "PICKED_UP" | "TRASH";

export type InquiryTimelineItemType =
  | "MESSAGE"
  | "ORDER_FORM_SUBMISSION"
  | "ORDER_FORM_REVISION_REQUEST"
  | "ORDER_CONFIRMATION"
  | "ORDER_CONFIRMATION_REVISION"
  | "PAYMENT_COMPLETED";

export type InquiryParticipant = {
  userId: string;
  name: string;
  phoneNumber?: string | null;
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

export type InquiryListRealtimePayload = {
  type: "INQUIRY_UPDATED" | string;
  inquiryId: string;
  unreadCount: number;
  latestEventAt: string | null;
  status: InquiryStatus;
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
  optionGroupId?: string | null;
  optionValue?: string | null;
  priceLabel?: string | null;
  required?: boolean;
};

export type InquiryReferenceAssetResponse = {
  assetId: string;
  source: string;
  sortOrder: number;
  status: string;
  deliveryUrl: string | null;
  variants: AssetVariant[];
};

export type InquiryReferenceAssetPreview = {
  assetId: string;
  deliveryUrl: string | null;
  status: string;
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
  sellerViewedAt: string | null;
  sellerViewed: boolean;
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
  confirmedOptionPrices?: string | null;
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

export type InquiryOrderConfirmationPreviewResponse = {
  orderFormSubmissionId: string;
  confirmationTitle: string;
  pickupAt: string;
  fixedOrderSummary: string;
  baseAmount: number;
  inquiryRequired: boolean;
  requiresManualAmount: boolean;
  unconfirmedOptions: InquiryUnconfirmedOption[];
};

export type InquiryUnconfirmedOption = {
  optionGroupId: string;
  optionValue: string;
  label: string;
  displayValue: string;
  priceLabel: string;
};

export type SendSellerOrderConfirmationAdditionalItem = {
  label: string;
  value: string;
  amount: number;
};

export type SendSellerOrderConfirmationConfirmedOptionPrice = {
  optionGroupId: string;
  optionValue: string;
  amount: number;
};

export type SendSellerOrderConfirmationRequest = {
  orderFormSubmissionId: string;
  confirmationTitle: string;
  summaryText: string;
  amount: number;
  pickupAt: string;
  confirmedOptionPrices: SendSellerOrderConfirmationConfirmedOptionPrice[];
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
  statusLabel: string;
  unreadCount: number;
  profileImageUrl: string | null;
};

export type InquiryChatMessage =
  | {
      id: string;
      kind: "order-request";
      owner: "buyer";
      imageUrl: string | null;
      receivedNoticeText: string;
      sellerViewed: boolean;
      sentAt: string;
      submissionId: string | null;
      summary: string;
      title: string;
    }
  | {
      id: string;
      kind: "order-form-revision-request";
      owner: "seller";
      sentAt: string;
      submissionId: string;
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
      amount: number | null;
      confirmationId: string;
    }
  | {
      id: string;
      kind: "payment-complete";
      owner: "buyer";
      sentAt: string;
      amount: number | null;
      orderId: string;
    }
  | {
      id: string;
      kind: "notice";
      text: string;
    };

export type InquiryOrderOption = {
  amount: number | null;
  assetPreviews?: InquiryReferenceAssetPreview[];
  id: string;
  label: string;
  value: string;
  priceText: string;
  required?: boolean;
  needsPrice?: boolean;
  optionGroupId: string | null;
  optionValue: string | null;
};

export type InquiryOrderConfirmation = {
  basePrice: number;
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
  confirmationsById: Record<string, InquiryOrderConfirmation>;
  ordersBySubmissionId: Record<string, InquiryOrderConfirmation>;
  timelineContext: {
    confirmationAmountsById: Record<string, number>;
    orderAmountsById: Record<string, number>;
    startReferenceImageUrl: string | null;
    submissionsById: Record<string, InquiryOrderFormSubmissionResponse>;
  };
};
