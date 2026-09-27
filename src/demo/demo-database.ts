const DEMO_STORAGE_KEY = "p3-seller-demo-database-v1";

export { DEMO_MODE } from "@/demo/demo-config";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "BUYER" | "SELLER";
  profileImageUrl: string | null;
};

type DemoStore = {
  id: string;
  sellerUserId: string;
  name: string;
  slug: string;
  description: string;
  profileAssetId: string;
};

type DemoAsset = {
  id: string;
  url: string;
  filename: string;
};

type DemoInquiry = {
  id: string;
  storeId: string;
  buyerUserId: string;
  status: "WAITING" | "IN_PROGRESS" | "PAID" | "PICKED_UP" | "TRASH";
  unreadByBuyer: number;
  unreadBySeller: number;
  createdAt: string;
};

type DemoSubmission = {
  id: string;
  inquiryId: string;
  submittedBy: string;
  pickupAt: string;
  submittedAt: string;
  assetIds: string[];
  sellerViewedAt: string | null;
};

type DemoConfirmation = {
  id: string;
  inquiryId: string;
  submissionId: string;
  amount: number;
  pickupAt: string;
  status: string;
  sentAt: string;
  buyerViewedAt: string | null;
  revisionRequestedAt: string | null;
  replacedByConfirmationId: string | null;
};

type DemoPaymentAttempt = {
  id: string;
  confirmationId: string;
  amount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
};

type DemoOrderStatus = "PAID" | "PICKED_UP" | "REFUND_REQUESTED" | "REFUNDED";

type DemoOrder = {
  id: string;
  storeId: string;
  buyerUserId: string;
  inquiryId: string;
  confirmationId: string;
  paymentAttemptId: string;
  orderNumber: string;
  menuName: string;
  optionSummary: string;
  assetIds: string[];
  paidAmount: number;
  pickupAt: string;
  status: DemoOrderStatus;
  refundRequestedAt: string | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type DemoRefund = {
  id: string;
  orderId: string;
  paymentAttemptId: string;
  amount: number;
  status: "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  outcome:
    "PROCESSING" | "RETRYABLE" | "MANUAL_REQUIRED" | "COMPLETED" | "FAILED";
  retryable: boolean;
  reason: string;
  createdAt: string;
  completedAt: string | null;
};

type DemoTimelineItem = {
  id: string;
  inquiryId: string;
  referenceId: string;
  type: string;
  senderUserId: string | null;
  content: string | null;
  assetIds: string[];
  createdAt: string;
};

export type DemoDatabase = {
  users: Record<string, DemoUser>;
  stores: Record<string, DemoStore>;
  assets: Record<string, DemoAsset>;
  inquiries: Record<string, DemoInquiry>;
  submissions: Record<string, DemoSubmission>;
  confirmations: Record<string, DemoConfirmation>;
  paymentAttempts: Record<string, DemoPaymentAttempt>;
  orders: Record<string, DemoOrder>;
  refunds: Record<string, DemoRefund>;
  timelineItems: Record<string, DemoTimelineItem>;
};

const atDay = (offset: number, hour = 12, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

const datePart = (value: string) => value.slice(0, 10);
const timePart = (value: string) => value.slice(11, 16);

export function createDemoDatabase(): DemoDatabase {
  const pickupPaid = atDay(2, 14);
  const pickupCompleted = atDay(-1, 16);
  const pickupRefund = atDay(4, 15, 30);
  const pickupRefunded = atDay(-3, 13);
  const pickupRetryable = atDay(5, 11);
  const pickupManual = atDay(6, 17);
  const pickupFailed = atDay(7, 12, 30);

  const assets: DemoDatabase["assets"] = Object.fromEntries(
    [
      [
        "asset-profile-store",
        "/demo/cakes/cake-profile.jpg",
        "cake-profile.jpg",
      ],
      ["asset-cake-flower", "/demo/cakes/cake-flower.jpg", "cake-flower.jpg"],
      [
        "asset-cake-berries",
        "/demo/cakes/cake-berries.jpg",
        "cake-berries.jpg",
      ],
      ["asset-cake-box", "/demo/cakes/cake-box.jpg", "cake-box.jpg"],
      ["asset-cake-party", "/demo/cakes/cake-party.jpg", "cake-party.jpg"],
    ].map(([id, url, filename]) => [id, { id, url, filename }]),
  );

  const users: DemoDatabase["users"] = {
    "user-buyer-demo": {
      id: "user-buyer-demo",
      name: "김민서",
      email: "buyer.demo@example.com",
      phoneNumber: "010-1234-5678",
      role: "BUYER",
      profileImageUrl: null,
    },
    "user-seller-demo": {
      id: "user-seller-demo",
      name: "위하다 사장님",
      email: "seller.demo@example.com",
      phoneNumber: "010-9876-5432",
      role: "SELLER",
      profileImageUrl: assets["asset-profile-store"].url,
    },
  };

  const stores: DemoDatabase["stores"] = {
    "store-001": {
      id: "store-001",
      sellerUserId: "user-seller-demo",
      name: "위하다 케이크",
      slug: "wihada-demo",
      description: "기념일의 마음을 케이크로 만드는 주문 제작 스토어입니다.",
      profileAssetId: "asset-profile-store",
    },
  };

  const scenarioRows = [
    ["inquiry-001", "WAITING", 2, 0, null, null, null],
    ["inquiry-002", "IN_PROGRESS", 0, 1, "submission-002", null, null],
    [
      "inquiry-003",
      "IN_PROGRESS",
      1,
      0,
      "submission-003",
      "confirmation-003",
      null,
    ],
    [
      "inquiry-004",
      "PAID",
      0,
      0,
      "submission-004",
      "confirmation-004",
      "order-001",
    ],
    [
      "inquiry-005",
      "PICKED_UP",
      0,
      0,
      "submission-005",
      "confirmation-005",
      "order-002",
    ],
    [
      "inquiry-006",
      "PAID",
      1,
      0,
      "submission-006",
      "confirmation-006",
      "order-003",
    ],
    [
      "inquiry-007",
      "PAID",
      0,
      0,
      "submission-007",
      "confirmation-007",
      "order-004",
    ],
    [
      "inquiry-008",
      "PAID",
      0,
      0,
      "submission-008",
      "confirmation-008",
      "order-005",
    ],
    [
      "inquiry-009",
      "PAID",
      0,
      0,
      "submission-009",
      "confirmation-009",
      "order-006",
    ],
    [
      "inquiry-010",
      "PAID",
      0,
      0,
      "submission-010",
      "confirmation-010",
      "order-007",
    ],
  ] as const;

  const inquiries: DemoDatabase["inquiries"] = {};
  const submissions: DemoDatabase["submissions"] = {};
  const confirmations: DemoDatabase["confirmations"] = {};
  const paymentAttempts: DemoDatabase["paymentAttempts"] = {};
  const orders: DemoDatabase["orders"] = {};
  const timelineItems: DemoDatabase["timelineItems"] = {};

  const pickupByOrder: Record<string, string> = {
    "order-001": pickupPaid,
    "order-002": pickupCompleted,
    "order-003": pickupRefund,
    "order-004": pickupRefunded,
    "order-005": pickupRetryable,
    "order-006": pickupManual,
    "order-007": pickupFailed,
  };
  const statusByOrder: Record<string, DemoOrderStatus> = {
    "order-001": "PAID",
    "order-002": "PICKED_UP",
    "order-003": "REFUND_REQUESTED",
    "order-004": "REFUNDED",
    "order-005": "REFUND_REQUESTED",
    "order-006": "REFUND_REQUESTED",
    "order-007": "REFUND_REQUESTED",
  };

  for (const [index, row] of scenarioRows.entries()) {
    const [
      inquiryId,
      status,
      unreadByBuyer,
      unreadBySeller,
      submissionId,
      confirmationId,
      orderId,
    ] = row;
    const createdAt = atDay(-12 + index, 10 + (index % 5));
    inquiries[inquiryId] = {
      id: inquiryId,
      storeId: "store-001",
      buyerUserId: "user-buyer-demo",
      status,
      unreadByBuyer,
      unreadBySeller,
      createdAt,
    };
    timelineItems[`event-${inquiryId}-welcome`] = {
      id: `event-${inquiryId}-welcome`,
      inquiryId,
      referenceId: `message-${inquiryId}-welcome`,
      type: "MESSAGE",
      senderUserId: "user-buyer-demo",
      content:
        index === 0
          ? "안녕하세요. 이번 주말 생일 케이크 상담 가능할까요?"
          : "주문 내용을 확인 부탁드립니다.",
      assetIds: index === 0 ? ["asset-cake-party"] : [],
      createdAt,
    };

    if (submissionId) {
      const pickupAt = orderId ? pickupByOrder[orderId] : atDay(3 + index, 15);
      submissions[submissionId] = {
        id: submissionId,
        inquiryId,
        submittedBy: "user-buyer-demo",
        pickupAt,
        submittedAt: atDay(-8 + index, 11),
        assetIds: [index % 2 ? "asset-cake-flower" : "asset-cake-berries"],
        sellerViewedAt: index === 1 ? null : atDay(-7 + index, 11, 30),
      };
      timelineItems[`event-${submissionId}`] = {
        id: `event-${submissionId}`,
        inquiryId,
        referenceId: submissionId,
        type: "ORDER_FORM_SUBMISSION",
        senderUserId: "user-buyer-demo",
        content: null,
        assetIds: submissions[submissionId].assetIds,
        createdAt: submissions[submissionId].submittedAt,
      };
    }

    if (confirmationId && submissionId) {
      const amount = 52000 + index * 3000;
      const pickupAt = orderId ? pickupByOrder[orderId] : atDay(4 + index, 15);
      confirmations[confirmationId] = {
        id: confirmationId,
        inquiryId,
        submissionId,
        amount,
        pickupAt,
        status: inquiryId === "inquiry-003" ? "REVISION_REQUESTED" : "SENT",
        sentAt: atDay(-6 + index, 13),
        buyerViewedAt: atDay(-6 + index, 14),
        revisionRequestedAt: inquiryId === "inquiry-003" ? atDay(-5, 15) : null,
        replacedByConfirmationId: null,
      };
      timelineItems[`event-${confirmationId}`] = {
        id: `event-${confirmationId}`,
        inquiryId,
        referenceId: confirmationId,
        type: "ORDER_CONFIRMATION",
        senderUserId: "user-seller-demo",
        content: null,
        assetIds: [],
        createdAt: confirmations[confirmationId].sentAt,
      };
      if (inquiryId === "inquiry-003") {
        timelineItems[`event-${confirmationId}-revision`] = {
          id: `event-${confirmationId}-revision`,
          inquiryId,
          referenceId: confirmationId,
          type: "ORDER_CONFIRMATION_REVISION",
          senderUserId: "user-buyer-demo",
          content: "레터링 문구를 변경하고 싶어요.",
          assetIds: [],
          createdAt: confirmations[confirmationId].revisionRequestedAt!,
        };
      }
    }

    if (orderId && confirmationId) {
      const paymentAttemptId = `payment-${orderId}`;
      const pickupAt = pickupByOrder[orderId];
      const amount = confirmations[confirmationId].amount;
      paymentAttempts[paymentAttemptId] = {
        id: paymentAttemptId,
        confirmationId,
        amount,
        status: "SUCCEEDED",
        createdAt: atDay(-4 + index, 12),
        completedAt: atDay(-4 + index, 12, 5),
        expiresAt: atDay(1 + index, 12),
      };
      const orderStatus = statusByOrder[orderId];
      orders[orderId] = {
        id: orderId,
        storeId: "store-001",
        buyerUserId: "user-buyer-demo",
        inquiryId,
        confirmationId,
        paymentAttemptId,
        orderNumber: `DEMO-${String(index + 1).padStart(4, "0")}`,
        menuName: ["플라워 케이크", "베리 케이크", "레터링 케이크"][index % 3],
        optionSummary: "1호 · 바닐라 시트 · 크림치즈",
        assetIds: submissions[submissionId!].assetIds,
        paidAmount: amount,
        pickupAt,
        status: orderStatus,
        refundRequestedAt: orderStatus.startsWith("REFUND")
          ? atDay(-1, 10 + index)
          : null,
        refundReason: orderStatus.startsWith("REFUND")
          ? "일정 변경으로 인한 환불 요청"
          : null,
        createdAt: paymentAttempts[paymentAttemptId].completedAt!,
        updatedAt: atDay(0, 9 + index),
      };
      timelineItems[`event-${orderId}-paid`] = {
        id: `event-${orderId}-paid`,
        inquiryId,
        referenceId: orderId,
        type: "PAYMENT_COMPLETED",
        senderUserId: "user-buyer-demo",
        content: null,
        assetIds: [],
        createdAt: orders[orderId].createdAt,
      };
    }
  }

  const refundSpecs = [
    ["refund-003", "order-003", "PROCESSING", "PROCESSING", false],
    ["refund-004", "order-004", "COMPLETED", "COMPLETED", false],
    ["refund-005", "order-005", "FAILED", "RETRYABLE", true],
    ["refund-006", "order-006", "FAILED", "MANUAL_REQUIRED", false],
    ["refund-007", "order-007", "FAILED", "FAILED", false],
  ] as const;
  const refunds: DemoDatabase["refunds"] = {};
  for (const [id, orderId, status, outcome, retryable] of refundSpecs) {
    const order = orders[orderId];
    refunds[id] = {
      id,
      orderId,
      paymentAttemptId: order.paymentAttemptId,
      amount: order.paidAmount,
      status,
      outcome,
      retryable,
      reason: order.refundReason ?? "환불 요청",
      createdAt: order.refundRequestedAt!,
      completedAt: outcome === "COMPLETED" ? atDay(-1, 16) : null,
    };
    timelineItems[`event-${id}`] = {
      id: `event-${id}`,
      inquiryId: order.inquiryId,
      referenceId: orderId,
      type:
        outcome === "COMPLETED"
          ? "ORDER_REFUND_COMPLETED"
          : "ORDER_REFUND_REQUESTED",
      senderUserId:
        outcome === "COMPLETED" ? "user-seller-demo" : "user-buyer-demo",
      content: null,
      assetIds: [],
      createdAt: refunds[id].completedAt ?? refunds[id].createdAt,
    };
  }

  const database = {
    users,
    stores,
    assets,
    inquiries,
    submissions,
    confirmations,
    paymentAttempts,
    orders,
    refunds,
    timelineItems,
  };
  validateDemoDatabase(database);
  return database;
}

let memoryDatabase: DemoDatabase | null = null;

export function getDemoDatabase() {
  if (memoryDatabase) return memoryDatabase;
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DemoDatabase;
        validateDemoDatabase(parsed);
        memoryDatabase = parsed;
        return parsed;
      } catch {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }
  }
  memoryDatabase = createDemoDatabase();
  return memoryDatabase;
}

export function saveDemoDatabase(database: DemoDatabase) {
  validateDemoDatabase(database);
  memoryDatabase = database;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(database));
    window.dispatchEvent(new CustomEvent("p3-demo-database-changed"));
  }
}

export function resetDemoDatabase() {
  memoryDatabase = createDemoDatabase();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("p3-demo-database-changed"));
  }
  return memoryDatabase;
}

export function appendDemoMessage(
  inquiryId: string,
  senderUserId: string,
  content: string,
) {
  const database = getDemoDatabase();
  requireEntity(database.inquiries, inquiryId, "inquiry");
  const normalized = content.trim();
  if (!normalized) return null;
  const duplicate = Object.values(database.timelineItems).find(
    (item) =>
      item.inquiryId === inquiryId &&
      item.senderUserId === senderUserId &&
      item.content === normalized,
  );
  if (duplicate) return duplicate;
  const createdAt = new Date().toISOString();
  const id = `event-message-${inquiryId}-${Date.now()}`;
  const item: DemoTimelineItem = {
    id,
    inquiryId,
    referenceId: id.replace("event-", ""),
    type: "MESSAGE",
    senderUserId,
    content: normalized,
    assetIds: [],
    createdAt,
  };
  database.timelineItems[id] = item;
  if (senderUserId === "user-buyer-demo")
    database.inquiries[inquiryId].unreadBySeller += 1;
  else database.inquiries[inquiryId].unreadByBuyer += 1;
  saveDemoDatabase(database);
  return item;
}

export function validateDemoDatabase(database: DemoDatabase) {
  const ids = new Set<string>();
  for (const collection of Object.values(database)) {
    for (const entity of Object.values(collection)) {
      if (ids.has(entity.id))
        throw new Error(`[demo] duplicate id: ${entity.id}`);
      ids.add(entity.id);
    }
  }
  for (const inquiry of Object.values(database.inquiries)) {
    requireEntity(
      database.stores,
      inquiry.storeId,
      `inquiry ${inquiry.id} store`,
    );
    requireEntity(
      database.users,
      inquiry.buyerUserId,
      `inquiry ${inquiry.id} buyer`,
    );
  }
  for (const submission of Object.values(database.submissions)) {
    requireEntity(
      database.inquiries,
      submission.inquiryId,
      `submission ${submission.id} inquiry`,
    );
    submission.assetIds.forEach((assetId) =>
      requireRenderableAsset(database, assetId),
    );
  }
  for (const confirmation of Object.values(database.confirmations)) {
    const submission = requireEntity(
      database.submissions,
      confirmation.submissionId,
      `confirmation ${confirmation.id} submission`,
    );
    if (submission.inquiryId !== confirmation.inquiryId)
      throw new Error(
        `[demo] confirmation ${confirmation.id} inquiry mismatch`,
      );
  }
  for (const order of Object.values(database.orders)) {
    const confirmation = requireEntity(
      database.confirmations,
      order.confirmationId,
      `order ${order.id} confirmation`,
    );
    if (
      confirmation.inquiryId !== order.inquiryId ||
      confirmation.amount !== order.paidAmount ||
      confirmation.pickupAt !== order.pickupAt
    ) {
      throw new Error(
        `[demo] order ${order.id} does not match its confirmation`,
      );
    }
    order.assetIds.forEach((assetId) =>
      requireRenderableAsset(database, assetId),
    );
  }
  for (const refund of Object.values(database.refunds)) {
    const order = requireEntity(
      database.orders,
      refund.orderId,
      `refund ${refund.id} order`,
    );
    if (refund.amount !== order.paidAmount)
      throw new Error(`[demo] refund ${refund.id} amount mismatch`);
    if (refund.outcome === "COMPLETED" && order.status !== "REFUNDED")
      throw new Error(
        `[demo] completed refund ${refund.id} requires REFUNDED order`,
      );
    if (refund.outcome !== "COMPLETED" && order.status !== "REFUND_REQUESTED")
      throw new Error(
        `[demo] pending refund ${refund.id} requires REFUND_REQUESTED order`,
      );
  }
  for (const item of Object.values(database.timelineItems)) {
    requireEntity(
      database.inquiries,
      item.inquiryId,
      `timeline ${item.id} inquiry`,
    );
    if (item.type === "ORDER_FORM_SUBMISSION")
      requireEntity(
        database.submissions,
        item.referenceId,
        `timeline ${item.id} submission`,
      );
    if (item.type.startsWith("ORDER_CONFIRMATION"))
      requireEntity(
        database.confirmations,
        item.referenceId,
        `timeline ${item.id} confirmation`,
      );
    if (
      [
        "PAYMENT_COMPLETED",
        "ORDER_REFUND_REQUESTED",
        "ORDER_REFUND_COMPLETED",
      ].includes(item.type)
    )
      requireEntity(
        database.orders,
        item.referenceId,
        `timeline ${item.id} order`,
      );
    item.assetIds.forEach((assetId) =>
      requireRenderableAsset(database, assetId),
    );
  }
  return true;
}

export function getDemoDateParts(value: string) {
  return { pickupDate: datePart(value), pickupTime: timePart(value) };
}

export function getDemoRouteManifest(
  database: DemoDatabase = getDemoDatabase(),
) {
  return {
    inquiryIds: Object.keys(database.inquiries),
    submissionRoutes: Object.values(database.submissions).map((item) => ({
      inquiryId: item.inquiryId,
      submissionId: item.id,
    })),
    confirmationRoutes: Object.values(database.confirmations).map((item) => ({
      inquiryId: item.inquiryId,
      confirmationId: item.id,
    })),
    orderIds: Object.keys(database.orders),
  };
}

export function requireEntity<T>(
  records: Record<string, T>,
  id: string,
  label: string,
): T {
  const entity = records[id];
  if (!entity) throw new Error(`[demo] ${label} not found: ${id}`);
  return entity;
}

function requireRenderableAsset(database: DemoDatabase, assetId: string) {
  const asset = requireEntity(database.assets, assetId, "asset");
  if (!asset.url.startsWith("/"))
    throw new Error(`[demo] asset ${assetId} has no renderable local URL`);
  return asset;
}
