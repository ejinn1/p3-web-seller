import { getAssetDeliveryUrl } from "@/features/assets/model/asset-delivery";
import type { AssetVariantType } from "@/features/assets/model/asset-types";
import type { SellerOrderListItem } from "@/features/orders/model/order-types";
import type {
  InquiryChatDetailResponse,
  InquiryChatMessage,
  InquiryDetail,
  InquiryLatestEvent,
  InquiryLatestOrderFormSubmission,
  InquiryListApiItem,
  InquiryListItem,
  InquiryOrderConfirmation,
  InquiryOrderConfirmationPreviewResponse,
  InquiryOrderConfirmationResponse,
  InquiryOrderFormSubmissionResponse,
  InquiryOrderOption,
  InquiryOrderOptionRow,
  InquiryReferenceAssetPreview,
  InquiryReferenceAssetResponse,
  InquiryStatus,
  InquiryTimelineItemResponse,
} from "@/features/inquiries/model/inquiry-types";

export type InquiryOrderOptionViewRow = InquiryOrderOptionRow & {
  assetPreviews?: InquiryReferenceAssetPreview[];
};

export function toInquiryListItem(item: InquiryListApiItem): InquiryListItem {
  const latestPreview = getLatestPreview(
    item.latestEvent,
    item.latestOrderFormSubmission,
  );
  const latestAt =
    latestPreview?.createdAt ?? item.latestEventAt ?? item.createdAt;

  return {
    id: item.inquiryId,
    buyerName: item.participant.name,
    latestOrderFormSubmissionId:
      item.latestOrderFormSubmission?.submissionId ?? null,
    lastMessage: formatLatestMessage(latestPreview),
    lastMessageAt: latestAt,
    lastMessageTimeLabel: formatShortTime(latestAt),
    profileImageUrl: item.participant.profileImageDeliveryUrl,
    status: item.status,
    statusLabel: toInquiryStatusLabel(item.status),
    unreadCount: item.unreadCount,
  };
}

export function toInquiryDetail({
  confirmations,
  detail,
  orders,
  preview,
  submissions,
  status = "WAITING",
  timeline,
}: {
  confirmations: InquiryOrderConfirmationResponse[];
  detail: InquiryChatDetailResponse;
  orders: SellerOrderListItem[];
  preview: InquiryOrderConfirmationPreviewResponse | null;
  submissions: InquiryOrderFormSubmissionResponse[];
  status?: InquiryStatus;
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
  const submissionsById = new Map(
    submissions.map((submission) => [submission.id, submission]),
  );
  const ordersBySubmissionId = Object.fromEntries(
    submissions.map((submission) => [
      submission.id,
      toSubmissionOrderConfirmation(
        detail,
        submission,
        preview?.orderFormSubmissionId === submission.id ? preview : null,
      ),
    ]),
  );
  const confirmationsById = Object.fromEntries(
    confirmations.map((confirmation) => [
      confirmation.confirmationId,
      toInquiryOrderConfirmation(
        detail,
        submissionsById.get(confirmation.orderFormSubmissionId) ?? null,
        confirmation,
        null,
      ),
    ]),
  );
  const timelineContext = {
    confirmationAmountsById: Object.fromEntries(confirmationAmounts),
    orderAmountsById: Object.fromEntries(
      orders.map((order) => [order.id, order.paidAmount]),
    ),
    startReferenceImageUrl: detail.startReferenceAsset?.deliveryUrl ?? null,
    submissionsById: Object.fromEntries(submissionsById),
  };

  return {
    createdAt: detail.createdAt,
    id: detail.inquiryId,
    buyerName: detail.participant.name,
    chatInfo: "픽업 상담",
    messages: toInquiryChatMessages(timeline, {
      confirmationAmountsById: timelineContext.confirmationAmountsById,
      orderAmountsById: timelineContext.orderAmountsById,
      participantUserId: detail.participant.userId,
      startReferenceImageUrl: timelineContext.startReferenceImageUrl,
      submissionsById: timelineContext.submissionsById,
    }),
    order: toInquiryOrderConfirmation(
      detail,
      latestSubmission,
      latestConfirmation,
      preview,
    ),
    confirmationsById,
    ordersBySubmissionId,
    participantUserId: detail.participant.userId,
    profileImageUrl: detail.participant.profileImageDeliveryUrl,
    status,
    statusLabel: toInquiryStatusLabel(status),
    timelineContext,
  };
}

export function toInquiryChatMessages(
  timeline: InquiryTimelineItemResponse[],
  context: {
    confirmationAmountsById: Record<string, number>;
    orderAmountsById: Record<string, number>;
    participantUserId: string | null;
    startReferenceImageUrl: string | null;
    submissionsById: Record<string, InquiryOrderFormSubmissionResponse>;
  },
): InquiryChatMessage[] {
  return timeline
    .map((item) =>
      toChatMessage(
        item,
        context.participantUserId,
        context.confirmationAmountsById[item.referenceId ?? ""] ?? null,
        context.orderAmountsById[item.referenceId ?? ""] ?? null,
        context.submissionsById[item.referenceId ?? ""] ?? null,
        context.startReferenceImageUrl,
      ),
    )
    .filter(isInquiryChatMessage);
}

export function appendTimelineItem(
  inquiry: InquiryDetail,
  item: InquiryTimelineItemResponse,
): InquiryDetail {
  const message = toInquiryChatMessages([item], {
    confirmationAmountsById: inquiry.timelineContext.confirmationAmountsById,
    orderAmountsById: inquiry.timelineContext.orderAmountsById,
    participantUserId: inquiry.participantUserId,
    startReferenceImageUrl: inquiry.timelineContext.startReferenceImageUrl,
    submissionsById: inquiry.timelineContext.submissionsById,
  }).at(0);
  if (!message) return inquiry;

  return {
    ...inquiry,
    messages: [...inquiry.messages, message],
  };
}

export function toInquiryStatusLabel(status: InquiryStatus) {
  const labels: Record<InquiryStatus, string> = {
    IN_PROGRESS: "상담중",
    PAID: "결제완료",
    PICKED_UP: "픽업완료",
    TRASH: "휴지통",
    WAITING: "접수대기",
  };

  return labels[status];
}

function toChatMessage(
  item: InquiryTimelineItemResponse,
  buyerUserId: string | null,
  confirmationAmount: number | null,
  orderAmount: number | null,
  submission: InquiryOrderFormSubmissionResponse | null = null,
  startReferenceImageUrl: string | null = null,
): InquiryChatMessage | null {
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
    const card = toOrderRequestCard(submission, startReferenceImageUrl);

    return {
      id: item.eventId,
      imageUrl: card.imageUrl,
      kind: "order-request" as const,
      owner: "buyer" as const,
      receivedNoticeText: formatOrderReceivedNotice(item.createdAt),
      sellerViewed: submission?.sellerViewed ?? false,
      sentAt,
      submissionId: item.referenceId ?? submission?.id ?? null,
      summary: card.summary,
      title: card.title,
    };
  }

  if (item.type === "ORDER_FORM_REVISION_REQUEST") {
    return {
      id: item.eventId,
      kind: "order-form-revision-request" as const,
      owner: "seller" as const,
      sentAt,
      submissionId: item.referenceId ?? "",
    };
  }

  if (item.type === "ORDER_CONFIRMATION") {
    return {
      amount: confirmationAmount,
      confirmationId: item.referenceId ?? "",
      id: item.eventId,
      kind: "payment-request" as const,
      owner: "seller" as const,
      sentAt,
    };
  }

  if (item.type === "PAYMENT_COMPLETED") {
    return {
      amount: orderAmount,
      id: item.eventId,
      kind: "payment-complete" as const,
      owner: "buyer" as const,
      orderId: item.referenceId ?? "",
      sentAt,
    };
  }

  if (item.type === "ORDER_REFUND_REQUESTED") {
    return {
      id: item.eventId,
      kind: "refund-request" as const,
      orderId: item.referenceId ?? "",
      owner: "buyer" as const,
      sentAt,
    };
  }

  if (item.type === "ORDER_REFUND_COMPLETED") {
    return {
      amount: orderAmount,
      id: item.eventId,
      kind: "refund-complete" as const,
      orderId: item.referenceId ?? "",
      owner: "seller" as const,
      sentAt,
    };
  }

  if (item.type === "ORDER_CONFIRMATION_REVISION") {
    return null;
  }

  return {
    id: item.eventId,
    kind: "notice" as const,
    text: item.content ?? "주문 확인서가 수정되었습니다.",
  };
}

function isInquiryChatMessage(
  message: InquiryChatMessage | null,
): message is InquiryChatMessage {
  return message !== null;
}

function toSubmissionOrderConfirmation(
  detail: InquiryChatDetailResponse,
  submission: InquiryOrderFormSubmissionResponse,
  preview: InquiryOrderConfirmationPreviewResponse | null,
) {
  return toInquiryOrderConfirmation(
    { ...detail, startReferenceAsset: null },
    { ...submission, optionRows: [] },
    null,
    preview,
  );
}

function toInquiryOrderConfirmation(
  detail: InquiryChatDetailResponse,
  submission: InquiryOrderFormSubmissionResponse | null,
  confirmation: InquiryOrderConfirmationResponse | null,
  preview: InquiryOrderConfirmationPreviewResponse | null,
): InquiryOrderConfirmation {
  const draftPreview = confirmation ? null : preview;
  const referenceAssetsById = new Map(
    (submission?.referenceAssets ?? []).map((asset) => [asset.assetId, asset]),
  );
  const rows = getInquiryOrderOptionRows(
    confirmation?.optionRows,
    confirmation?.summaryText,
    submission?.optionRows,
    submission?.answers,
    confirmation?.additionalItems,
    referenceAssetsById,
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
  const basePrice =
    confirmation?.amount ??
    draftPreview?.baseAmount ??
    rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const unconfirmedOptions = new Map(
    (draftPreview?.unconfirmedOptions ?? []).map((option) => [
      `${option.optionGroupId}:${option.optionValue}`,
      option,
    ]),
  );
  const options = rows.map((row, index) =>
    toInquiryOrderOption(row, index, unconfirmedOptions),
  );
  const existingOptionIds = new Set(options.map((option) => option.id));

  for (const option of draftPreview?.unconfirmedOptions ?? []) {
    const id = `${option.optionGroupId}:${option.optionValue}`;

    if (!existingOptionIds.has(id)) {
      options.push({
        amount: null,
        id,
        label: option.label,
        needsPrice: true,
        optionGroupId: option.optionGroupId,
        optionValue: option.optionValue,
        priceText: option.priceLabel,
        value: option.displayValue,
      });
    }
  }

  return {
    basePrice,
    buyerName: detail.participant.name,
    buyerPhone: detail.participant.phoneNumber ?? "",
    confirmationTitle:
      confirmation?.confirmationTitle ??
      draftPreview?.confirmationTitle ??
      "주문확인서",
    imageUrl:
      detail.startReferenceAsset?.deliveryUrl ??
      getFirstReferenceAssetPreview(submission?.referenceAssets)?.deliveryUrl ??
      null,
    orderFormSubmissionId:
      confirmation?.orderFormSubmissionId ??
      draftPreview?.orderFormSubmissionId ??
      submission?.id ??
      null,
    options,
    pickupAt:
      confirmation?.pickupAt ??
      draftPreview?.pickupAt ??
      (submission
        ? toPickupInstant(submission.pickupDate, submission.pickupTime)
        : null),
    pickupDate,
    pickupTime,
    summaryText:
      confirmation?.summaryText ??
      draftPreview?.fixedOrderSummary ??
      rows.map((row) => `${row.label}: ${row.value}`).join("\n") ??
      "주문확인서",
    totalPrice: confirmation?.amount ?? basePrice,
  };
}

export function applyOrderConfirmationPreview(
  order: InquiryOrderConfirmation,
  preview: InquiryOrderConfirmationPreviewResponse,
): InquiryOrderConfirmation {
  const unconfirmedOptions = new Map(
    preview.unconfirmedOptions.map((option) => [
      `${option.optionGroupId}:${option.optionValue}`,
      option,
    ]),
  );
  const options = order.options.map((option) => {
    const previewOption = unconfirmedOptions.get(option.id);

    if (!previewOption) return option;

    unconfirmedOptions.delete(option.id);
    return {
      ...option,
      amount: null,
      label: previewOption.label,
      needsPrice: true,
      optionGroupId: previewOption.optionGroupId,
      optionValue: previewOption.optionValue,
      priceText: previewOption.priceLabel,
      value: previewOption.displayValue,
    };
  });

  for (const option of unconfirmedOptions.values()) {
    options.push({
      amount: null,
      id: `${option.optionGroupId}:${option.optionValue}`,
      label: option.label,
      needsPrice: true,
      optionGroupId: option.optionGroupId,
      optionValue: option.optionValue,
      priceText: option.priceLabel,
      value: option.displayValue,
    });
  }

  return {
    ...order,
    basePrice: preview.baseAmount,
    confirmationTitle: preview.confirmationTitle,
    options,
    orderFormSubmissionId: preview.orderFormSubmissionId,
    pickupAt: preview.pickupAt,
    pickupDate: formatFullDate(preview.pickupAt),
    pickupTime: formatShortTime(preview.pickupAt),
    summaryText: preview.fixedOrderSummary,
    totalPrice: preview.baseAmount,
  };
}

export function getInquiryOrderOptionRows(
  optionRows: InquiryOrderOptionRow[] | undefined,
  optionSummary: string | undefined,
  submissionRows: InquiryOrderOptionRow[] | undefined,
  answers: string | undefined,
  additionalItems: string | undefined,
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  const answerRows = parseRows(answers, referenceAssetsById);

  if (optionRows?.length) {
    return applyAnswerAssetPreviews(optionRows, answerRows);
  }

  const parsedRows = [
    ...parseRows(optionSummary, referenceAssetsById),
    ...answerRows,
    ...parseRows(additionalItems, referenceAssetsById),
  ];

  return parsedRows.length
    ? parsedRows
    : applyAnswerAssetPreviews(submissionRows ?? [], answerRows);
}

function parseRows(
  value: string | undefined,
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return rowsFromParsedSummary(parsed, referenceAssetsById);
  } catch {
    return [{ amount: null, label: "옵션", value }];
  }
}

function rowsFromParsedSummary(
  value: unknown,
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  if (Array.isArray(value)) {
    const answerRows = rowsFromAnswers(value, referenceAssetsById);

    if (answerRows.length) {
      return answerRows;
    }

    return value.flatMap((item, index) =>
      normalizeParsedRow(item, index, referenceAssetsById),
    );
  }

  if (isRecord(value)) {
    if (Array.isArray(value.answers)) {
      const answerRows = rowsFromAnswers(value.answers, referenceAssetsById);

      if (answerRows.length) {
        return answerRows;
      }
    }

    return Object.entries(value)
      .filter(
        ([key]) =>
          !["orderFormSubmissionId", "templateId", "submittedAt"].includes(key),
      )
      .flatMap(([label, rowValue]) =>
        rowsFromUnknownValue(label, rowValue, referenceAssetsById),
      );
  }

  return [];
}

function rowsFromAnswers(
  answers: unknown[],
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  return answers.flatMap((answer, index) => {
    if (!isRecord(answer)) {
      return normalizeParsedRow(answer, index, referenceAssetsById);
    }

    const label = normalizeText(answer.label) || `옵션 ${index + 1}`;
    const optionGroupId = stringOrNull(answer.optionGroupId);
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
                assetPreviews: getOptionAssetPreviews(
                  option,
                  referenceAssetsById,
                ),
                label,
                optionGroupId,
                optionValue: stringOrNull(option.value ?? option.optionValue),
                priceLabel: stringOrNull(option.priceLabel),
                required: booleanOrUndefined(answer.required),
                value: formatOptionValue(option),
              },
            ]
          : rowsFromUnknownValue(label, option, referenceAssetsById),
      );
    }

    return rowsFromUnknownValue(
      label,
      answer.value ?? answer.answer ?? answer.content,
      referenceAssetsById,
    );
  });
}

function normalizeParsedRow(
  item: unknown,
  index: number,
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  if (typeof item === "string") {
    return [{ amount: null, label: `옵션 ${index + 1}`, value: item }];
  }

  if (!isRecord(item)) {
    return [];
  }

  return [
    {
      amount: numberOrNull(item.amount) ?? numberOrNull(item.price) ?? null,
      assetPreviews: getOptionAssetPreviews(item, referenceAssetsById),
      label: normalizeText(item.label ?? item.name) || `옵션 ${index + 1}`,
      priceLabel: stringOrNull(item.priceLabel),
      required: booleanOrUndefined(item.required),
      value: formatOptionValue(item, true),
    },
  ];
}

function toInquiryOrderOption(
  row: InquiryOrderOptionViewRow,
  index: number,
  unconfirmedOptions: Map<
    string,
    InquiryOrderConfirmationPreviewResponse["unconfirmedOptions"][number]
  >,
): InquiryOrderOption {
  const optionGroupId = row.optionGroupId ?? null;
  const optionValue = row.optionValue ?? null;
  const unconfirmedOption =
    optionGroupId && optionValue
      ? unconfirmedOptions.get(`${optionGroupId}:${optionValue}`)
      : undefined;
  const priceLabel =
    unconfirmedOption?.priceLabel.trim() || row.priceLabel?.trim();

  return {
    amount: row.amount,
    assetPreviews: row.assetPreviews?.length ? row.assetPreviews : undefined,
    id:
      optionGroupId && optionValue
        ? `${optionGroupId}:${optionValue}`
        : `${toOptionId(row.label)}-${index}`,
    label: row.label,
    needsPrice: Boolean(priceLabel && row.amount === null),
    optionGroupId,
    optionValue,
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
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryOrderOptionViewRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      rowsFromUnknownValue(label, item, referenceAssetsById),
    );
  }

  if (isRecord(value)) {
    return [
      {
        amount: numberOrNull(value.price) ?? numberOrNull(value.amount),
        assetPreviews: getOptionAssetPreviews(value, referenceAssetsById),
        label,
        priceLabel: stringOrNull(value.priceLabel),
        value: formatOptionValue(value, true),
      },
    ];
  }

  const text = normalizeText(value);

  return text ? [{ amount: null, label, value: text }] : [];
}

function applyAnswerAssetPreviews(
  rows: InquiryOrderOptionRow[],
  answerRows: InquiryOrderOptionViewRow[],
): InquiryOrderOptionViewRow[] {
  const assetPreviewsByLabel = new Map<
    string,
    InquiryReferenceAssetPreview[]
  >();

  for (const row of answerRows) {
    if (!row.assetPreviews?.length) {
      continue;
    }

    assetPreviewsByLabel.set(row.label, [
      ...(assetPreviewsByLabel.get(row.label) ?? []),
      ...row.assetPreviews,
    ]);
  }

  return rows.map((row) => ({
    ...row,
    assetPreviews: assetPreviewsByLabel.get(row.label),
  }));
}

function getOptionAssetPreviews(
  option: unknown,
  referenceAssetsById: Map<string, InquiryReferenceAssetResponse>,
): InquiryReferenceAssetPreview[] | undefined {
  if (!isRecord(option)) {
    return undefined;
  }

  const embeddedPreviews = Array.isArray(option.assets)
    ? option.assets.flatMap((value, index) => {
        if (!isRecord(value)) {
          return [];
        }

        return [
          {
            assetId: normalizeText(value.assetId) || `asset-${index}`,
            deliveryUrl: getEmbeddedAssetDeliveryUrl(value),
            status: normalizeText(value.status) || "MISSING",
          },
        ];
      })
    : [];

  if (embeddedPreviews.length) {
    return embeddedPreviews;
  }

  if (!Array.isArray(option.assetIds)) {
    return undefined;
  }

  const previews = option.assetIds.flatMap((assetId) => {
    if (typeof assetId !== "string") {
      return [];
    }

    const asset = referenceAssetsById.get(assetId);
    const deliveryUrl = asset
      ? getAssetDeliveryUrl(asset.deliveryUrl, asset.variants, [
          "THUMBNAIL",
          "MEDIUM",
          "LARGE",
        ])
      : undefined;

    return [
      {
        assetId,
        deliveryUrl: deliveryUrl ?? null,
        status: asset?.status ?? "MISSING",
      },
    ];
  });

  return previews.length ? previews : undefined;
}

function getFirstReferenceAssetPreview(
  assets: InquiryReferenceAssetResponse[] | undefined,
): InquiryReferenceAssetPreview | undefined {
  const sortedAssets = [...(assets ?? [])].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );

  for (const asset of sortedAssets) {
    const deliveryUrl = getAssetDeliveryUrl(asset.deliveryUrl, asset.variants, [
      "THUMBNAIL",
      "MEDIUM",
      "LARGE",
    ]);

    if (deliveryUrl) {
      return { assetId: asset.assetId, deliveryUrl, status: asset.status };
    }
  }

  return undefined;
}

function getEmbeddedAssetDeliveryUrl(asset: Record<string, unknown>) {
  const variants = Array.isArray(asset.variants)
    ? asset.variants.flatMap((variant) => {
        if (!isRecord(variant)) {
          return [];
        }

        const deliveryUrl = normalizeText(variant.deliveryUrl);
        const type = normalizeText(variant.type);

        return deliveryUrl && isAssetVariantType(type)
          ? [
              {
                deliveryUrl,
                height: numberOrNull(variant.height) ?? 0,
                type,
                width: numberOrNull(variant.width) ?? 0,
              },
            ]
          : [];
      })
    : [];

  return (
    getAssetDeliveryUrl(normalizeText(asset.deliveryUrl) || null, variants, [
      "THUMBNAIL",
      "MEDIUM",
      "LARGE",
    ]) ?? null
  );
}

function isAssetVariantType(value: string): value is AssetVariantType {
  return ["THUMBNAIL", "MEDIUM", "LARGE"].includes(value);
}

function toOrderRequestCard(
  submission: InquiryOrderFormSubmissionResponse | null,
  startReferenceImageUrl: string | null,
) {
  if (!submission) {
    return {
      imageUrl: startReferenceImageUrl,
      summary: "주문서를 확인하고 주문확인서를 작성해주세요.",
      title: "주문서가 도착했어요",
    };
  }

  const referenceAssetsById = new Map(
    submission.referenceAssets.map((asset) => [asset.assetId, asset]),
  );
  const rows = getInquiryOrderOptionRows(
    undefined,
    undefined,
    submission.optionRows,
    submission.answers,
    undefined,
    referenceAssetsById,
  );
  const sizeRow = rows.find((row) => row.label.includes("사이즈"));
  const titleRow = sizeRow ?? rows[0];
  const summaryRows = rows
    .filter((row) => row !== titleRow && !row.assetPreviews?.length)
    .slice(0, 2);
  const optionImageUrl = rows
    .flatMap((row) => row.assetPreviews ?? [])
    .find((asset) => asset.deliveryUrl)?.deliveryUrl;
  const referenceImageUrl = getFirstReferenceAssetPreview(
    submission.referenceAssets,
  )?.deliveryUrl;

  return {
    imageUrl:
      startReferenceImageUrl ?? referenceImageUrl ?? optionImageUrl ?? null,
    summary:
      summaryRows.map((row) => row.value).join(" / ") ||
      "주문서를 확인하고 주문확인서를 작성해주세요.",
    title: titleRow
      ? `${titleRow.value}${
          sizeRow && !titleRow.value.includes("사이즈") ? " 사이즈" : ""
        }`
      : "주문서가 도착했어요",
  };
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

type InquiryLatestPreview =
  | {
      createdAt: string;
      event: InquiryLatestEvent;
      kind: "event";
    }
  | {
      createdAt: string;
      kind: "submission";
      submission: InquiryLatestOrderFormSubmission;
    };

function getLatestPreview(
  latestEvent: InquiryLatestEvent | null,
  latestSubmission: InquiryLatestOrderFormSubmission | null,
): InquiryLatestPreview | null {
  if (latestEvent) {
    return {
      createdAt: latestEvent.createdAt,
      event: latestEvent,
      kind: "event",
    };
  }

  if (latestSubmission) {
    return {
      createdAt: latestSubmission.submittedAt,
      kind: "submission",
      submission: latestSubmission,
    };
  }

  return null;
}

function formatLatestMessage(latestPreview: InquiryLatestPreview | null) {
  if (!latestPreview) {
    return "새 상담이 도착했습니다.";
  }

  if (latestPreview.kind === "submission") {
    return "주문서가 작성되었습니다.";
  }

  const { event } = latestPreview;

  if (event.type === "MESSAGE") {
    return normalizeText(event.content) || "메시지가 도착했습니다.";
  }

  if (event.type === "ORDER_FORM_SUBMISSION") {
    return "주문서가 작성되었습니다.";
  }

  if (event.type === "ORDER_FORM_REVISION_REQUEST") {
    return "주문서 수정 요청";
  }

  if (event.type === "ORDER_CONFIRMATION") {
    return "주문 확인서를 보냈습니다.";
  }

  if (event.type === "ORDER_CONFIRMATION_REVISION") {
    return "주문 확인서가 수정되었습니다.";
  }

  if (event.type === "PAYMENT_COMPLETED") {
    return "결제가 완료되었습니다.";
  }

  if (event.type === "ORDER_REFUND_REQUESTED") {
    return "취소 요청을 접수했습니다.";
  }

  if (event.type === "ORDER_REFUND_COMPLETED") {
    return "취소 처리가 완료되었습니다.";
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

function formatOrderReceivedNotice(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "주문이 접수되었습니다.";
  }

  const parts = new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "numeric",
    timeZone: "Asia/Seoul",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const month = Number(part("month"));
  const day = Number(part("day"));
  const hour = Number(part("hour"));
  const minute = part("minute");

  return `${month}월 ${day}일 ${hour}:${minute}분 주문이 접수되었습니다.`;
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
