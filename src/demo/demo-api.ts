import {
  appendDemoMessage,
  getDemoDatabase,
  getDemoDateParts,
  requireEntity,
  saveDemoDatabase,
  type DemoDatabase,
} from "@/demo/demo-database";

export type DemoApiResponse<T> = { success: true; data: T; requestId: string };

export class DemoApiError extends Error {
  constructor(
    message: string,
    public readonly status = 404,
  ) {
    super(message);
    this.name = "DemoApiError";
  }
}

const ok = <T>(data: T): DemoApiResponse<T> => ({
  success: true,
  data,
  requestId: `demo-${Date.now()}`,
});
const decode = (value: string) => decodeURIComponent(value);

export async function demoApiRequest<T>(
  rawPath: string,
  init: RequestInit = {},
): Promise<DemoApiResponse<T>> {
  const database = getDemoDatabase();
  const url = new URL(rawPath, "http://demo.local");
  const path = url.pathname;
  const method = (init.method ?? "GET").toUpperCase();

  if (path === "/auth/me")
    return ok(toSellerProfile(database)) as DemoApiResponse<T>;
  if (path === "/seller/dashboard")
    return ok(toSellerDashboard(database)) as DemoApiResponse<T>;
  if (path === "/seller/inquiries" && method === "GET")
    return ok(
      toSellerInquiryList(database, url.searchParams),
    ) as DemoApiResponse<T>;
  if (path === "/seller/orders" && method === "GET")
    return ok(toSellerOrders(database, url.searchParams)) as DemoApiResponse<T>;

  const inquiryMatch = path.match(/^\/seller\/inquiries\/([^/]+)$/);
  if (inquiryMatch && method === "GET")
    return ok(
      toSellerInquiryDetail(database, decode(inquiryMatch[1])),
    ) as DemoApiResponse<T>;
  const eventsMatch = path.match(/^\/seller\/inquiries\/([^/]+)\/events$/);
  if (eventsMatch)
    return ok(
      toSellerTimeline(
        database,
        decode(eventsMatch[1]),
        Number(url.searchParams.get("size") ?? 50),
      ),
    ) as DemoApiResponse<T>;
  const readMatch = path.match(/^\/seller\/inquiries\/([^/]+)\/read$/);
  if (readMatch && method === "PATCH") {
    const inquiry = requireDemo(
      database.inquiries,
      decode(readMatch[1]),
      "문의",
    );
    inquiry.unreadBySeller = 0;
    saveDemoDatabase(database);
    return ok(undefined) as DemoApiResponse<T>;
  }
  const trashMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/(trash|restore)$/,
  );
  if (trashMatch && method === "PATCH") {
    const inquiry = requireDemo(
      database.inquiries,
      decode(trashMatch[1]),
      "문의",
    );
    inquiry.status = trashMatch[2] === "trash" ? "TRASH" : "IN_PROGRESS";
    saveDemoDatabase(database);
    return ok(undefined) as DemoApiResponse<T>;
  }
  const submissionsMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/order-form-submissions$/,
  );
  if (submissionsMatch) {
    const inquiryId = decode(submissionsMatch[1]);
    requireDemo(database.inquiries, inquiryId, "문의");
    return ok(
      Object.values(database.submissions)
        .filter((item) => item.inquiryId === inquiryId)
        .map((item) => toSellerSubmission(database, inquiryId, item.id)),
    ) as DemoApiResponse<T>;
  }
  const submissionMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/order-form-submissions\/([^/]+)$/,
  );
  if (submissionMatch && method === "GET")
    return ok(
      toSellerSubmission(
        database,
        decode(submissionMatch[1]),
        decode(submissionMatch[2]),
      ),
    ) as DemoApiResponse<T>;
  const submissionViewMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/order-form-submissions\/([^/]+)\/view$/,
  );
  if (submissionViewMatch && method === "POST") {
    const submission = requireDemo(
      database.submissions,
      decode(submissionViewMatch[2]),
      "주문서 제출본",
    );
    assertRelation(
      submission.inquiryId,
      decode(submissionViewMatch[1]),
      "주문서 문의",
    );
    submission.sellerViewedAt ??= new Date().toISOString();
    saveDemoDatabase(database);
    return ok(
      toSellerSubmission(database, submission.inquiryId, submission.id),
    ) as DemoApiResponse<T>;
  }
  const revisionMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/order-form-submissions\/([^/]+)\/revision-request$/,
  );
  if (revisionMatch && method === "POST") {
    const inquiryId = decode(revisionMatch[1]);
    const submissionId = decode(revisionMatch[2]);
    const submission = requireDemo(
      database.submissions,
      submissionId,
      "주문서 제출본",
    );
    assertRelation(submission.inquiryId, inquiryId, "주문서 문의");
    const eventId = `event-${submissionId}-seller-revision`;
    database.timelineItems[eventId] ??= {
      id: eventId,
      inquiryId,
      referenceId: submissionId,
      type: "ORDER_FORM_REVISION_REQUEST",
      senderUserId: "user-seller-demo",
      content: "주문서 수정을 요청했어요.",
      assetIds: [],
      createdAt: new Date().toISOString(),
    };
    saveDemoDatabase(database);
    return ok(
      toTimelineItem(database.timelineItems[eventId]),
    ) as DemoApiResponse<T>;
  }
  const confirmationPreviewMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/confirmations\/preview$/,
  );
  if (confirmationPreviewMatch)
    return ok(
      toConfirmationPreview(
        database,
        decode(confirmationPreviewMatch[1]),
        url.searchParams.get("orderFormSubmissionId") ?? "",
      ),
    ) as DemoApiResponse<T>;
  const confirmationListMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/confirmations$/,
  );
  if (confirmationListMatch && method === "GET") {
    const inquiryId = decode(confirmationListMatch[1]);
    return ok(
      Object.values(database.confirmations)
        .filter((item) => item.inquiryId === inquiryId)
        .map((item) => toSellerConfirmation(database, inquiryId, item.id)),
    ) as DemoApiResponse<T>;
  }
  if (confirmationListMatch && method === "POST") {
    const inquiryId = decode(confirmationListMatch[1]);
    return ok(
      createSellerConfirmation(
        database,
        inquiryId,
        readJsonBody<Record<string, unknown>>(init) ?? {},
      ),
    ) as DemoApiResponse<T>;
  }
  const confirmationMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/confirmations\/([^/]+)$/,
  );
  if (confirmationMatch && method === "GET")
    return ok(
      toSellerConfirmation(
        database,
        decode(confirmationMatch[1]),
        decode(confirmationMatch[2]),
      ),
    ) as DemoApiResponse<T>;
  const replacementMatch = path.match(
    /^\/seller\/inquiries\/([^/]+)\/confirmations\/([^/]+)\/replacement$/,
  );
  if (replacementMatch && method === "PATCH") {
    const confirmation = requireDemo(
      database.confirmations,
      decode(replacementMatch[2]),
      "주문확인서",
    );
    assertRelation(
      confirmation.inquiryId,
      decode(replacementMatch[1]),
      "주문확인서 문의",
    );
    const replacementId = String(
      readJsonBody<{ replacementConfirmationId?: string }>(init)
        ?.replacementConfirmationId ?? "",
    );
    requireDemo(database.confirmations, replacementId, "대체 주문확인서");
    confirmation.status = "REPLACED";
    confirmation.replacedByConfirmationId = replacementId;
    saveDemoDatabase(database);
    return ok(
      toSellerConfirmation(database, confirmation.inquiryId, confirmation.id),
    ) as DemoApiResponse<T>;
  }

  const orderMatch = path.match(/^\/seller\/orders\/([^/]+)$/);
  if (orderMatch && method === "GET")
    return ok(
      toSellerOrderDetail(database, decode(orderMatch[1])),
    ) as DemoApiResponse<T>;
  const quoteMatch = path.match(/^\/seller\/orders\/([^/]+)\/refund-quote$/);
  if (quoteMatch) {
    const order = requireDemo(database.orders, decode(quoteMatch[1]), "주문");
    return ok({
      orderId: order.id,
      paidAmount: order.paidAmount,
      refundAmount: order.paidAmount,
      refundRate: 100,
      calculationBaseAt: new Date().toISOString(),
      calculationBasis: "CURRENT_TIME",
    }) as DemoApiResponse<T>;
  }
  const pickupMatch = path.match(/^\/seller\/orders\/([^/]+)\/pickup$/);
  if (pickupMatch && method === "PATCH") {
    const order = requireDemo(database.orders, decode(pickupMatch[1]), "주문");
    if (order.status === "PAID") order.status = "PICKED_UP";
    order.updatedAt = new Date().toISOString();
    saveDemoDatabase(database);
    return ok(toSellerOrder(database, order)) as DemoApiResponse<T>;
  }
  const refundMatch = path.match(/^\/seller\/orders\/([^/]+)\/refund$/);
  if (refundMatch && method === "POST")
    return ok(
      processSellerRefund(database, decode(refundMatch[1])),
    ) as DemoApiResponse<T>;
  const refreshMatch = path.match(
    /^\/seller\/orders\/([^/]+)\/refund\/refresh$/,
  );
  if (refreshMatch && method === "POST")
    return ok(
      refreshSellerRefund(database, decode(refreshMatch[1])),
    ) as DemoApiResponse<T>;
  const manualMatch = path.match(
    /^\/seller\/orders\/([^/]+)\/refunds\/([^/]+)\/manual-complete$/,
  );
  if (manualMatch && method === "POST")
    return ok(
      completeManualRefund(
        database,
        decode(manualMatch[1]),
        decode(manualMatch[2]),
      ),
    ) as DemoApiResponse<T>;

  throw new DemoApiError(
    `데모 API가 지원하지 않는 요청입니다: ${method} ${path}`,
    501,
  );
}

export function sendSellerDemoMessage(inquiryId: string, content: string) {
  return appendDemoMessage(inquiryId, "user-seller-demo", content);
}

function toSellerProfile(database: DemoDatabase) {
  const user = database.users["user-seller-demo"];
  return {
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    signupProvider: "KAKAO",
    profileAssetId: "asset-profile-store",
    profileImageDeliveryUrl: user.profileImageUrl,
    name: user.name,
    role: user.role,
    status: "ACTIVE",
    createdAt: database.inquiries["inquiry-001"].createdAt,
    nextRoute: "/seller/home",
  };
}

function timelineFor(database: DemoDatabase, inquiryId: string) {
  requireDemo(database.inquiries, inquiryId, "문의");
  return Object.values(database.timelineItems)
    .filter((item) => item.inquiryId === inquiryId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function currentSubmission(database: DemoDatabase, inquiryId: string) {
  return (
    Object.values(database.submissions)
      .filter((item) => item.inquiryId === inquiryId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] ?? null
  );
}

function toSellerInquiryList(database: DemoDatabase, params: URLSearchParams) {
  const status = params.get("status");
  const unreadOnly = params.get("unreadOnly") === "true";
  const store = database.stores["store-001"];
  const buyer = database.users["user-buyer-demo"];
  return Object.values(database.inquiries)
    .filter(
      (item) =>
        (!status || item.status === status) &&
        (!unreadOnly || item.unreadBySeller > 0),
    )
    .map((inquiry) => {
      const events = timelineFor(database, inquiry.id);
      const latest = events.at(-1) ?? null;
      const submission = currentSubmission(database, inquiry.id);
      return {
        inquiryId: inquiry.id,
        storeId: store.id,
        status: inquiry.status,
        storeName: store.name,
        storeSlug: store.slug,
        participant: {
          userId: buyer.id,
          name: buyer.name,
          phoneNumber: buyer.phoneNumber,
          profileImageDeliveryUrl: buyer.profileImageUrl,
        },
        unreadCount: inquiry.unreadBySeller,
        latestEventAt: latest?.createdAt ?? inquiry.createdAt,
        latestEvent: latest
          ? {
              eventId: latest.id,
              referenceId: latest.referenceId,
              type: latest.type,
              senderUserId: latest.senderUserId,
              content: latest.content,
              createdAt: latest.createdAt,
            }
          : null,
        latestOrderFormSubmission: submission
          ? { submissionId: submission.id, submittedAt: submission.submittedAt }
          : null,
        currentOrderFormSubmissionId: submission?.id ?? null,
        myLastReadAt: inquiry.unreadBySeller ? null : new Date().toISOString(),
        createdAt: inquiry.createdAt,
      };
    })
    .sort((a, b) =>
      (b.latestEventAt ?? "").localeCompare(a.latestEventAt ?? ""),
    );
}

function toSellerInquiryDetail(database: DemoDatabase, inquiryId: string) {
  const inquiry = requireDemo(database.inquiries, inquiryId, "문의");
  const store = database.stores[inquiry.storeId];
  const buyer = database.users[inquiry.buyerUserId];
  const firstAssetId =
    timelineFor(database, inquiryId).flatMap((item) => item.assetIds)[0] ??
    null;
  return {
    inquiryId,
    storeId: store.id,
    storeName: store.name,
    storeSlug: store.slug,
    participant: {
      userId: buyer.id,
      name: buyer.name,
      phoneNumber: buyer.phoneNumber,
      profileImageDeliveryUrl: buyer.profileImageUrl,
    },
    startReferenceAsset: firstAssetId
      ? {
          assetId: firstAssetId,
          source: "STORE_GALLERY",
          deliveryUrl: database.assets[firstAssetId].url,
        }
      : null,
    currentOrderFormSubmissionId:
      currentSubmission(database, inquiryId)?.id ?? null,
    myLastReadAt: inquiry.unreadBySeller ? null : new Date().toISOString(),
    participantLastReadAt: inquiry.unreadByBuyer
      ? null
      : new Date().toISOString(),
    createdAt: inquiry.createdAt,
  };
}

function toSellerTimeline(
  database: DemoDatabase,
  inquiryId: string,
  size: number,
) {
  const items = timelineFor(database, inquiryId)
    .slice(-size)
    .map(toTimelineItem);
  return {
    items,
    hasNext: false,
    nextCursorCreatedAt: null,
    nextCursorId: null,
  };
}

function toTimelineItem(item: DemoDatabase["timelineItems"][string]) {
  return {
    eventId: item.id,
    referenceId: item.referenceId,
    type: item.type,
    senderUserId: item.senderUserId,
    createdAt: item.createdAt,
    content: item.content,
    assetIds: item.assetIds,
  };
}

function orderRows() {
  return [
    {
      label: "사이즈",
      value: "1호 (15cm)",
      amount: 42000,
      optionGroupId: "group-size",
      optionValue: "SIZE_1",
      priceLabel: "+42,000원",
      required: true,
    },
    {
      label: "맛",
      value: "바닐라 시트",
      amount: 0,
      optionGroupId: "group-flavor",
      optionValue: "VANILLA",
      priceLabel: null,
      required: true,
    },
    {
      label: "레터링",
      value: "Happy Birthday",
      amount: 10000,
      optionGroupId: "group-lettering",
      optionValue: "LETTERING",
      priceLabel: "+10,000원",
      required: false,
    },
  ];
}

function toSellerSubmission(
  database: DemoDatabase,
  inquiryId: string,
  submissionId: string,
) {
  const submission = requireDemo(
    database.submissions,
    submissionId,
    "주문서 제출본",
  );
  assertRelation(submission.inquiryId, inquiryId, "주문서 문의");
  const { pickupDate, pickupTime } = getDemoDateParts(submission.pickupAt);
  return {
    id: submission.id,
    inquiryId,
    templateId: "template-001",
    submittedBy: submission.submittedBy,
    pickupDate,
    pickupTime,
    answers: JSON.stringify(orderRows()),
    referenceAssets: submission.assetIds.map((assetId, index) => ({
      assetId,
      source: "STORE_GALLERY",
      sortOrder: index,
      status: "READY",
      deliveryUrl: database.assets[assetId].url,
      variants: [
        {
          type: "MEDIUM",
          deliveryUrl: database.assets[assetId].url,
          width: 960,
          height: 960,
        },
      ],
    })),
    optionRows: orderRows(),
    cancellationRefundAgreed: true,
    sellerViewedAt: submission.sellerViewedAt,
    sellerViewed: Boolean(submission.sellerViewedAt),
    current: currentSubmission(database, inquiryId)?.id === submission.id,
    submittedAt: submission.submittedAt,
  };
}

function toSellerConfirmation(
  database: DemoDatabase,
  inquiryId: string,
  confirmationId: string,
) {
  const confirmation = requireDemo(
    database.confirmations,
    confirmationId,
    "주문확인서",
  );
  assertRelation(confirmation.inquiryId, inquiryId, "주문확인서 문의");
  return {
    confirmationId: confirmation.id,
    inquiryId,
    orderFormSubmissionId: confirmation.submissionId,
    confirmationTitle: "주문확인서",
    summaryText: "1호 · 바닐라 시트 · 크림치즈",
    amount: confirmation.amount,
    pickupAt: confirmation.pickupAt,
    storeNameSnapshot: database.stores["store-001"].name,
    orderSummary: JSON.stringify(orderRows()),
    confirmedOptionPrices: JSON.stringify([]),
    additionalItems: JSON.stringify([]),
    optionRows: orderRows(),
    sellerNote: "픽업 시간에 맞춰 준비해 둘게요.",
    status: confirmation.status,
    sentAt: confirmation.sentAt,
    revisionRequestedAt: confirmation.revisionRequestedAt,
    buyerViewedAt: confirmation.buyerViewedAt,
    replacedByConfirmationId: confirmation.replacedByConfirmationId,
    createdAt: confirmation.sentAt,
  };
}

function toConfirmationPreview(
  database: DemoDatabase,
  inquiryId: string,
  submissionId: string,
) {
  const submission = requireDemo(
    database.submissions,
    submissionId,
    "주문서 제출본",
  );
  assertRelation(submission.inquiryId, inquiryId, "주문서 문의");
  return {
    orderFormSubmissionId: submission.id,
    confirmationTitle: "주문확인서",
    pickupAt: submission.pickupAt,
    fixedOrderSummary: JSON.stringify(orderRows()),
    baseAmount: 52000,
    inquiryRequired: false,
    requiresManualAmount: false,
    unconfirmedOptions: [],
  };
}

function createSellerConfirmation(
  database: DemoDatabase,
  inquiryId: string,
  body: Record<string, unknown>,
) {
  requireDemo(database.inquiries, inquiryId, "문의");
  const submissionId = String(
    body.orderFormSubmissionId ??
      currentSubmission(database, inquiryId)?.id ??
      "",
  );
  const submission = requireDemo(
    database.submissions,
    submissionId,
    "주문서 제출본",
  );
  assertRelation(submission.inquiryId, inquiryId, "주문서 문의");
  const existing = Object.values(database.confirmations).find(
    (item) =>
      item.inquiryId === inquiryId &&
      item.submissionId === submissionId &&
      item.status !== "REPLACED",
  );
  if (existing) return toSellerConfirmation(database, inquiryId, existing.id);
  const id = `confirmation-demo-${inquiryId}`;
  database.confirmations[id] = {
    id,
    inquiryId,
    submissionId,
    amount: Number(body.amount ?? 52000),
    pickupAt: String(body.pickupAt ?? submission.pickupAt),
    status: "SENT",
    sentAt: new Date().toISOString(),
    buyerViewedAt: null,
    revisionRequestedAt: null,
    replacedByConfirmationId: null,
  };
  database.timelineItems[`event-${id}`] = {
    id: `event-${id}`,
    inquiryId,
    referenceId: id,
    type: "ORDER_CONFIRMATION",
    senderUserId: "user-seller-demo",
    content: null,
    assetIds: [],
    createdAt: database.confirmations[id].sentAt,
  };
  saveDemoDatabase(database);
  return toSellerConfirmation(database, inquiryId, id);
}

function toSellerOrder(
  database: DemoDatabase,
  order: DemoDatabase["orders"][string],
) {
  return {
    id: order.id,
    storeId: order.storeId,
    buyerUserId: order.buyerUserId,
    inquiryId: order.inquiryId,
    confirmationId: order.confirmationId,
    orderNumber: order.orderNumber,
    menuName: order.menuName,
    optionSummary: order.optionSummary,
    startReferenceAssets: order.assetIds.map(
      (assetId) => database.assets[assetId].url,
    ),
    referenceAssets: order.assetIds.map((assetId, index) => ({
      assetId,
      source: "STORE_GALLERY",
      sortOrder: index,
      status: "READY",
      deliveryUrl: database.assets[assetId].url,
      variants: [],
    })),
    paidAmount: order.paidAmount,
    pickupAt: order.pickupAt,
    status: order.status,
    refundRequestedAt: order.refundRequestedAt,
    refundReason: order.refundReason,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function toSellerOrders(database: DemoDatabase, params: URLSearchParams) {
  const statuses = params.get("status")?.split(",").filter(Boolean) ?? [];
  return Object.values(database.orders)
    .filter((order) => !statuses.length || statuses.includes(order.status))
    .map((order) => toSellerOrder(database, order))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function toSellerOrderDetail(database: DemoDatabase, orderId: string) {
  const order = requireDemo(database.orders, orderId, "주문");
  const attempt = requireDemo(
    database.paymentAttempts,
    order.paymentAttemptId,
    "결제 시도",
  );
  const refunds = Object.values(database.refunds)
    .filter((refund) => refund.orderId === orderId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((refund) => ({
      refundId: refund.id,
      orderId,
      paymentAttemptId: refund.paymentAttemptId,
      requestedBy: "user-buyer-demo",
      amount: refund.amount,
      refundRate: 100,
      reason: refund.reason,
      status: refund.status,
      outcome: refund.outcome,
      retryable: refund.retryable,
      providerRefundId:
        refund.outcome === "COMPLETED" ? `demo-provider-${refund.id}` : null,
      failureCode: refund.status === "FAILED" ? `DEMO_${refund.outcome}` : null,
      failureMessage:
        refund.status === "FAILED" ? "데모 환불 상태입니다." : null,
      failureDetails: null,
      createdAt: refund.createdAt,
      completedAt: refund.completedAt,
      completedBy: refund.outcome === "COMPLETED" ? "user-seller-demo" : null,
      completionMethod: refund.outcome === "COMPLETED" ? "MANUAL" : null,
      failedAt: refund.status === "FAILED" ? refund.createdAt : null,
    }));
  return {
    optionRows: orderRows(),
    order: toSellerOrder(database, order),
    paymentAttempt: {
      paymentAttemptId: attempt.id,
      confirmationId: attempt.confirmationId,
      sessionId: `demo-session-${attempt.id}`,
      amount: attempt.amount,
      status: attempt.status,
      failureCode: null,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
      expiresAt: attempt.expiresAt,
      expired: false,
    },
    refunds,
  };
}

function processSellerRefund(database: DemoDatabase, orderId: string) {
  const order = requireDemo(database.orders, orderId, "주문");
  if (order.status === "REFUNDED")
    return toSellerOrderDetail(database, orderId);
  const refundId = `refund-${order.id.replace("order-", "")}`;
  const refund = database.refunds[refundId];
  if (!refund) {
    database.refunds[refundId] = {
      id: refundId,
      orderId,
      paymentAttemptId: order.paymentAttemptId,
      amount: order.paidAmount,
      status: "PROCESSING",
      outcome: "PROCESSING",
      retryable: false,
      reason: order.refundReason ?? "판매자 환불 처리",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
  } else if (refund.outcome === "RETRYABLE") {
    refund.status = "PROCESSING";
    refund.outcome = "PROCESSING";
    refund.retryable = false;
  }
  order.status = "REFUND_REQUESTED";
  order.refundRequestedAt ??= new Date().toISOString();
  saveDemoDatabase(database);
  return toSellerOrderDetail(database, orderId);
}

function refreshSellerRefund(database: DemoDatabase, orderId: string) {
  const refund = Object.values(database.refunds).find(
    (item) => item.orderId === orderId,
  );
  if (!refund) throw new DemoApiError(`환불을 찾을 수 없습니다: ${orderId}`);
  if (refund.outcome === "PROCESSING") {
    refund.status = "COMPLETED";
    refund.outcome = "COMPLETED";
    refund.completedAt = new Date().toISOString();
    database.orders[orderId].status = "REFUNDED";
  }
  saveDemoDatabase(database);
  return toSellerOrderDetail(database, orderId);
}

function completeManualRefund(
  database: DemoDatabase,
  orderId: string,
  refundId: string,
) {
  const refund = requireDemo(database.refunds, refundId, "환불");
  assertRelation(refund.orderId, orderId, "환불 주문");
  if (refund.outcome !== "COMPLETED") {
    refund.status = "COMPLETED";
    refund.outcome = "COMPLETED";
    refund.completedAt = new Date().toISOString();
    database.orders[orderId].status = "REFUNDED";
  }
  saveDemoDatabase(database);
  return toSellerOrderDetail(database, orderId);
}

function toSellerDashboard(database: DemoDatabase) {
  const orders = Object.values(database.orders);
  const today = new Date().toISOString().slice(0, 10);
  const total = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const refunded = Object.values(database.refunds)
    .filter((refund) => refund.outcome === "COMPLETED")
    .reduce((sum, refund) => sum + refund.amount, 0);
  return {
    today,
    weekStartDate: today,
    weekEndDate: today,
    currentMonthRevenue: {
      startDate: today.slice(0, 7) + "-01",
      endDate: today,
      paymentRevenueAmount: total,
      completedRefundAmount: refunded,
      netSalesAmount: total - refunded,
      settlementFeeRateBasisPoints: 300,
      settlementFeeAmount: Math.round((total - refunded) * 0.03),
      settlementEstimateAmount: Math.round((total - refunded) * 0.97),
    },
    todayOrderCount: orders.length,
    thisWeekOrderCount: orders.length,
    paidOrderCount: orders.filter((order) => order.status === "PAID").length,
    cancelRefundRequestCount: orders.filter(
      (order) => order.status === "REFUND_REQUESTED",
    ).length,
    unansweredInquiryCount: Object.values(database.inquiries).filter(
      (inquiry) => inquiry.unreadBySeller > 0,
    ).length,
    todayOrders: orders.map((order) => ({
      orderId: order.id,
      inquiryId: order.inquiryId,
      buyerUserId: order.buyerUserId,
      orderNumber: order.orderNumber,
      menuName: order.menuName,
      paidAmount: order.paidAmount,
      pickupAt: order.pickupAt,
      pickupDate: order.pickupAt.slice(0, 10),
      pickupTime: order.pickupAt.slice(11, 16),
      status: order.status,
    })),
  };
}

function readJsonBody<T>(init: RequestInit): T | null {
  if (typeof init.body !== "string") return null;
  try {
    return JSON.parse(init.body) as T;
  } catch {
    return null;
  }
}

function requireDemo<T>(
  records: Record<string, T>,
  id: string,
  label: string,
): T {
  try {
    return requireEntity(records, id, label);
  } catch {
    throw new DemoApiError(`${label} 정보를 찾을 수 없습니다: ${id}`);
  }
}

function assertRelation(actual: string, expected: string, label: string) {
  if (actual !== expected)
    throw new DemoApiError(`${label} 관계가 일치하지 않습니다.`, 409);
}
