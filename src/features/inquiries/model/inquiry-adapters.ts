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
    lastMessage: formatLatestMessage(
      item.latestEvent,
      item.latestOrderFormSubmission,
    ),
    lastMessageAt: latestAt,
    lastMessageTimeLabel: formatShortTime(latestAt),
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
  const confirmationAmounts = new Map(
    confirmations.map((confirmation) => [
      confirmation.confirmationId,
      confirmation.amount,
    ]),
  );

  return {
    createdAt: detail.createdAt,
    id: detail.inquiryId,
    buyerName: detail.participant.name,
    chatInfo: "픽업 상담",
    messages: timeline.map((item) =>
      toChatMessage(
        item,
        detail.participant.userId,
        confirmationAmounts.get(item.referenceId ?? "") ??
          latestConfirmation?.amount ??
          0,
      ),
    ),
    order: toInquiryOrderConfirmation(
      detail,
      latestSubmission,
      latestConfirmation,
    ),
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
      toChatMessage(item, inquiry.participantUserId, inquiry.order.totalPrice),
    ],
  };
}

function toChatMessage(
  item: InquiryTimelineItemResponse,
  buyerUserId: string | null,
  confirmationAmount: number,
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
      amount: confirmationAmount,
      id: item.eventId,
      kind: "payment-request" as const,
      owner: "seller" as const,
      sentAt,
    };
  }

  if (item.type === "PAYMENT_COMPLETED") {
    return {
      amount: confirmationAmount,
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
    submission?.optionRows,
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
    : submission?.pickupTime
      ? formatLocalTime(submission.pickupTime)
      : "";

  return {
    buyerName: detail.participant.name,
    buyerPhone: "",
    confirmationTitle: confirmation?.confirmationTitle ?? "주문확인서",
    imageUrl: detail.startReferenceAsset?.deliveryUrl ?? null,
    orderFormSubmissionId:
      confirmation?.orderFormSubmissionId ?? submission?.id ?? null,
    options: rows.map(toInquiryOrderOption),
    pickupAt:
      confirmation?.pickupAt ??
      (submission
        ? toPickupInstant(submission.pickupDate, submission.pickupTime)
        : null),
    pickupDate,
    pickupTime,
    summaryText:
      confirmation?.summaryText ??
      rows.map((row) => `${row.label}: ${row.value}`).join("\n") ??
      "주문확인서",
    totalPrice:
      confirmation?.amount ??
      rows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
  };
}

function getOptionRows(
  optionRows: InquiryOrderOptionRow[] | undefined,
  optionSummary: string | undefined,
  submissionRows: InquiryOrderOptionRow[] | undefined,
  answers: string | undefined,
  additionalItems: string | undefined,
) {
  if (optionRows?.length) {
    return optionRows;
  }

  const parsedRows = [
    ...parseRows(optionSummary),
    ...parseRows(answers),
    ...parseRows(additionalItems),
  ];

  return parsedRows.length ? parsedRows : (submissionRows ?? []);
}

function parseRows(value: string | undefined): InquiryOrderOptionRow[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return rowsFromParsedSummary(parsed);
  } catch {
    return [{ amount: null, label: "옵션", value }];
  }
}

function rowsFromParsedSummary(value: unknown): InquiryOrderOptionRow[] {
  if (Array.isArray(value)) {
    const answerRows = rowsFromAnswers(value);

    if (answerRows.length) {
      return answerRows;
    }

    return value.flatMap((item, index) => normalizeParsedRow(item, index));
  }

  if (isRecord(value)) {
    if (Array.isArray(value.answers)) {
      const answerRows = rowsFromAnswers(value.answers);

      if (answerRows.length) {
        return answerRows;
      }
    }

    return Object.entries(value)
      .filter(
        ([key]) =>
          !["orderFormSubmissionId", "templateId", "submittedAt"].includes(key),
      )
      .flatMap(([label, rowValue]) => rowsFromUnknownValue(label, rowValue));
  }

  return [];
}

function rowsFromAnswers(answers: unknown[]): InquiryOrderOptionRow[] {
  return answers.flatMap((answer, index) => {
    if (!isRecord(answer)) {
      return normalizeParsedRow(answer, index);
    }

    const label = normalizeText(answer.label) || `옵션 ${index + 1}`;
    const selectedOptions = Array.isArray(answer.selectedOptions)
      ? answer.selectedOptions
      : Array.isArray(answer.value)
        ? answer.value
        : [];

    if (selectedOptions.length) {
      return selectedOptions.flatMap((option) =>
        isRecord(option)
          ? [
              {
                amount:
                  numberOrNull(option.price) ?? numberOrNull(option.amount),
                label,
                priceLabel: stringOrNull(option.priceLabel),
                required: booleanOrUndefined(answer.required),
                value: formatOptionValue(option),
              },
            ]
          : rowsFromUnknownValue(label, option),
      );
    }

    return rowsFromUnknownValue(
      label,
      answer.value ?? answer.answer ?? answer.content,
    );
  });
}

function normalizeParsedRow(
  item: unknown,
  index: number,
): InquiryOrderOptionRow[] {
  if (typeof item === "string") {
    return [{ amount: null, label: `옵션 ${index + 1}`, value: item }];
  }

  if (!isRecord(item)) {
    return [];
  }

  return [
    {
      amount: numberOrNull(item.amount) ?? numberOrNull(item.price) ?? null,
      label: normalizeText(item.label ?? item.name) || `옵션 ${index + 1}`,
      priceLabel: stringOrNull(item.priceLabel),
      required: booleanOrUndefined(item.required),
      value: formatOptionValue(item, true),
    },
  ];
}

function toInquiryOrderOption(
  row: InquiryOrderOptionRow,
  index: number,
): InquiryOrderOption {
  const priceLabel = row.priceLabel?.trim();

  return {
    id: `${toOptionId(row.label)}-${index}`,
    label: row.label,
    needsPrice: Boolean(priceLabel && row.amount === null),
    priceText:
      row.amount === null
        ? (priceLabel ?? "")
        : row.amount > 0
          ? `+ ${formatPrice(row.amount)}`
          : "",
    required: row.required,
    value: row.value,
  };
}

function rowsFromUnknownValue(
  label: string,
  value: unknown,
): InquiryOrderOptionRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => rowsFromUnknownValue(label, item));
  }

  if (isRecord(value)) {
    return [
      {
        amount: numberOrNull(value.price) ?? numberOrNull(value.amount),
        label,
        priceLabel: stringOrNull(value.priceLabel),
        value: formatOptionValue(value, true),
      },
    ];
  }

  const text = normalizeText(value);

  return text ? [{ amount: null, label, value: text }] : [];
}

function formatOptionValue(
  option: Record<string, unknown>,
  preferValue = false,
) {
  const text = normalizeText(option.text);

  if (text) {
    return text;
  }

  const value = normalizeText(option.value ?? option.optionValue);

  if (preferValue && value) {
    return value;
  }

  const label = normalizeText(option.label ?? option.optionLabel);

  if (label) {
    return label;
  }

  if (value) {
    return value;
  }

  const assetIds = option.assetIds;

  if (Array.isArray(assetIds) && assetIds.length) {
    return `첨부 이미지 ${assetIds.length}개`;
  }

  return "-";
}

function toOptionId(label: string) {
  if (label.includes("사이즈")) {
    return "size";
  }

  if (label.includes("모양")) {
    return "shape";
  }

  if (label.includes("맛")) {
    return "flavor";
  }

  if (label.includes("포장")) {
    return "packaging";
  }

  if (label.includes("디자인")) {
    return "design";
  }

  if (label.includes("기타")) {
    return "extra";
  }

  return label;
}

function toPickupInstant(pickupDate: string, pickupTime: string) {
  return new Date(`${pickupDate}T${pickupTime}+09:00`).toISOString();
}

function formatLocalTime(value: string) {
  return formatShortTime(`1970-01-01T${value}+09:00`);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown) {
  return typeof value === "number" ? value : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function booleanOrUndefined(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
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
  return (
    [...items]
      .sort((a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime())
      .at(-1) ?? null
  );
}
