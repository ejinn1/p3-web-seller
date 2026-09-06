import type {
  InquiryChatDetailResponse,
  InquiryChatMessage,
  InquiryDetail,
  InquiryLatestEvent,
  InquiryListApiItem,
  InquiryListItem,
  InquiryOrderConfirmation,
  InquiryOrderConfirmationResponse,
  InquiryOrderFormSubmissionResponse,
  InquiryOrderOption,
  InquiryOrderOptionRow,
  InquiryTimelineItemResponse,
} from "@/features/inquiries/model/inquiry-types";

export function toInquiryListItem(item: InquiryListApiItem): InquiryListItem {
  const latestAt =
    item.latestEvent?.createdAt ??
    item.latestOrderFormSubmission?.submittedAt ??
    item.latestEventAt ??
    item.createdAt;

  return {
    id: item.inquiryId,
    buyerName: item.participant.name,
    hasOrderFormSubmission: Boolean(item.latestOrderFormSubmission),
    lastMessage: formatLatestMessage(item.latestEvent, item.latestOrderFormSubmission),
    lastMessageAt: formatShortTime(latestAt),
    profileImageUrl: item.participant.profileImageDeliveryUrl,
    status: item.status,
    unreadCount: item.unreadCount,
  };
}

export function toInquiryDetail({
  confirmations,
  detail,
  submissions,
  timeline,
}: {
  confirmations: InquiryOrderConfirmationResponse[];
  detail: InquiryChatDetailResponse;
  submissions: InquiryOrderFormSubmissionResponse[];
  timeline: InquiryTimelineItemResponse[];
}): InquiryDetail {
  const latestSubmission = newestBy(submissions, "submittedAt");
  const latestConfirmation = newestBy(confirmations, "createdAt");

  return {
    id: detail.inquiryId,
    buyerName: detail.participant.name,
    chatInfo: "픽업 상담",
    messages: timeline.map((item) => toChatMessage(item, detail.participant.userId)),
    order: toInquiryOrderConfirmation(detail, latestSubmission, latestConfirmation),
    participantUserId: detail.participant.userId,
    profileImageUrl: detail.participant.profileImageDeliveryUrl,
    status: "IN_PROGRESS",
    statusLabel: "상담중",
  };
}

export function appendTimelineItem(
  inquiry: InquiryDetail,
  item: InquiryTimelineItemResponse,
): InquiryDetail {
  return {
    ...inquiry,
    messages: [
      ...inquiry.messages,
      toChatMessage(item, inquiry.participantUserId),
    ],
  };
}

function toChatMessage(
  item: InquiryTimelineItemResponse,
  buyerUserId: string | null,
): InquiryChatMessage {
  const owner: "buyer" | "seller" =
    buyerUserId && item.senderUserId === buyerUserId ? "buyer" : "seller";
  const sentAt = formatShortTime(item.createdAt);

  if (item.type === "MESSAGE") {
    return {
      id: item.eventId,
      kind: "text" as const,
      owner,
      sentAt,
      text: item.content ?? "",
    };
  }

  if (item.type === "ORDER_FORM_SUBMISSION") {
    return {
      id: item.eventId,
      kind: "order-request" as const,
      owner: "buyer" as const,
      sentAt,
    };
  }

  if (item.type === "ORDER_CONFIRMATION") {
    return {
      amount: 0,
      id: item.eventId,
      kind: "payment-request" as const,
      owner: "seller" as const,
      sentAt,
    };
  }

  if (item.type === "PAYMENT_COMPLETED") {
    return {
      amount: 0,
      id: item.eventId,
      kind: "payment-complete" as const,
      owner: "buyer" as const,
      sentAt,
    };
  }

  return {
    id: item.eventId,
    kind: "notice" as const,
    text: item.content ?? "주문 확인서가 수정되었습니다.",
  };
}

function toInquiryOrderConfirmation(
  detail: InquiryChatDetailResponse,
  submission: InquiryOrderFormSubmissionResponse | null,
  confirmation: InquiryOrderConfirmationResponse | null,
): InquiryOrderConfirmation {
  const rows = getOptionRows(
    confirmation?.optionRows,
    confirmation?.summaryText,
    submission?.answers,
    confirmation?.additionalItems,
  );
  const pickupDate = confirmation?.pickupAt
    ? formatFullDate(confirmation.pickupAt)
    : submission?.pickupDate
      ? formatDateOnly(submission.pickupDate)
      : "";
  const pickupTime = confirmation?.pickupAt
    ? formatShortTime(confirmation.pickupAt)
    : submission?.pickupTime ?? "";

  return {
    buyerName: detail.participant.name,
    buyerPhone: "",
    imageUrl: detail.startReferenceAsset?.deliveryUrl ?? null,
    options: rows.map(toInquiryOrderOption),
    pickupDate,
    pickupTime,
    totalPrice:
      confirmation?.amount ??
      rows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
  };
}

function getOptionRows(
  optionRows: InquiryOrderOptionRow[] | undefined,
  optionSummary: string | undefined,
  answers: string | undefined,
  additionalItems: string | undefined,
) {
  if (optionRows?.length) {
    return optionRows;
  }

  return [
    ...parseRows(optionSummary),
    ...parseRows(answers),
    ...parseRows(additionalItems),
  ];
}

function parseRows(value: string | undefined): InquiryOrderOptionRow[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item, index) => normalizeParsedRow(item, index));
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([label, rowValue]) => ({
        amount: null,
        label,
        value: String(rowValue ?? ""),
      }));
    }
  } catch {
    return [{ amount: null, label: "옵션", value }];
  }

  return [{ amount: null, label: "옵션", value }];
}

function normalizeParsedRow(item: unknown, index: number): InquiryOrderOptionRow[] {
  if (typeof item === "string") {
    return [{ amount: null, label: `옵션 ${index + 1}`, value: item }];
  }

  if (typeof item !== "object" || item === null) {
    return [];
  }

  const record = item as Record<string, unknown>;

  return [
    {
      amount:
        typeof record.amount === "number"
          ? record.amount
          : typeof record.price === "number"
            ? record.price
            : null,
      label: String(record.label ?? record.name ?? `옵션 ${index + 1}`),
      value: String(record.value ?? record.answer ?? record.content ?? ""),
    },
  ];
}

function toInquiryOrderOption(row: InquiryOrderOptionRow, index: number): InquiryOrderOption {
  return {
    id: `${row.label}-${index}`,
    label: row.label,
    priceText: row.amount === null ? "" : `+ ${formatPrice(row.amount)}`,
    value: row.value,
  };
}

function formatLatestMessage(
  latestEvent: InquiryLatestEvent | null,
  latestSubmission: { submittedAt: string } | null,
) {
  if (latestEvent?.content) {
    return latestEvent.content;
  }

  if (latestEvent?.type === "ORDER_FORM_SUBMISSION" || latestSubmission) {
    return "주문서가 작성되었습니다.";
  }

  if (latestEvent?.type === "ORDER_CONFIRMATION") {
    return "주문 확인서를 보냈습니다.";
  }

  if (latestEvent?.type === "PAYMENT_COMPLETED") {
    return "결제가 완료되었습니다.";
  }

  return "새 상담이 도착했습니다.";
}

function formatShortTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    weekday: "long",
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
    weekday: "long",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function newestBy<T extends Record<K, string>, K extends keyof T>(
  items: T[],
  key: K,
) {
  return [...items].sort(
    (a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime(),
  ).at(-1) ?? null;
}
