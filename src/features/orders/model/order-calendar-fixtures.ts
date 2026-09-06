import type {
  OrderCalendarDisplayMeta,
  OrderCalendarOptionLine,
  OrderCalendarResponse,
  SellerOrderDetailResponse,
} from "@/features/orders/model/order-calendar-types";

const ids = {
  buyer1: "11111111-1111-4111-8111-111111111111",
  buyer2: "22222222-2222-4222-8222-222222222222",
  buyer3: "33333333-3333-4333-8333-333333333333",
  confirmation: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  inquiry: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  order1: "00000000-0000-4000-8000-000000000001",
  order2: "00000000-0000-4000-8000-000000000002",
  order3: "00000000-0000-4000-8000-000000000003",
  order4: "00000000-0000-4000-8000-000000000004",
  order5: "00000000-0000-4000-8000-000000000005",
  order6: "00000000-0000-4000-8000-000000000006",
  store: "99999999-9999-4999-8999-999999999999",
};

const orders = [
  {
    orderId: ids.order1,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer1,
    orderNumber: "ORD-20260812-001",
    menuName: "플라워 케이크",
    paidAmount: 64000,
    pickupAt: "2026-08-19T05:00:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "14:00:00",
    status: "PAID" as const,
  },
  {
    orderId: ids.order2,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer2,
    orderNumber: "ORD-20260812-002",
    menuName: "체리 케이크",
    paidAmount: 71500,
    pickupAt: "2026-08-19T06:30:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "15:30:00",
    status: "PAID" as const,
  },
  {
    orderId: ids.order3,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer3,
    orderNumber: "ORD-20260812-003",
    menuName: "레터링 케이크",
    paidAmount: 54000,
    pickupAt: "2026-08-19T09:00:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "18:00:00",
    status: "PAID" as const,
  },
  {
    orderId: ids.order4,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer1,
    orderNumber: "ORD-20260812-004",
    menuName: "플라워 케이크",
    paidAmount: 64000,
    pickupAt: "2026-08-19T05:00:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "14:00:00",
    status: "PAID" as const,
  },
  {
    orderId: ids.order5,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer2,
    orderNumber: "ORD-20260812-005",
    menuName: "체리 케이크",
    paidAmount: 71500,
    pickupAt: "2026-08-19T06:30:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "15:30:00",
    status: "PAID" as const,
  },
  {
    orderId: ids.order6,
    inquiryId: ids.inquiry,
    buyerUserId: ids.buyer3,
    orderNumber: "ORD-20260812-006",
    menuName: "레터링 케이크",
    paidAmount: 54000,
    pickupAt: "2026-08-19T09:00:00Z",
    pickupDate: "2026-08-12",
    pickupTime: "18:00:00",
    status: "PAID" as const,
  },
];

export const orderCalendarDisplayMeta: Record<
  string,
  OrderCalendarDisplayMeta
> = {
  [ids.order1]: {
    buyerName: "김지현",
    thumbnailUrl: "/orders/order-thumb-box.png",
  },
  [ids.order2]: {
    buyerName: "박서연",
    thumbnailUrl: "/orders/order-thumb-flower.png",
  },
  [ids.order3]: {
    buyerName: "이도현",
    thumbnailUrl: "/orders/order-thumb-cherry.png",
  },
  [ids.order4]: {
    buyerName: "김지현",
    thumbnailUrl: "/orders/order-thumb-box.png",
  },
  [ids.order5]: {
    buyerName: "박서연",
    thumbnailUrl: "/orders/order-thumb-flower.png",
  },
  [ids.order6]: {
    buyerName: "이도현",
    thumbnailUrl: "/orders/order-thumb-cherry.png",
  },
};

export const orderCalendarDayRevenue: Record<string, number> =
  Object.fromEntries(
    Array.from({ length: 31 }, (_, index) => {
      const date = `2026-08-${String(index + 1).padStart(2, "0")}`;
      return [date, index % 7 === 2 ? 0 : 100000];
    }),
  );

export const orderCalendarMonthlyMetrics = {
  revenueAmount: 14638697,
  canceledAmount: 138697,
};

export const orderCalendarFixture: OrderCalendarResponse = {
  startDate: "2026-08-01",
  endDate: "2026-08-31",
  status: null,
  totalOrderCount: orders.length,
  days: Array.from({ length: 31 }, (_, index) => {
    const date = `2026-08-${String(index + 1).padStart(2, "0")}`;
    const dayOrders = date === "2026-08-12" ? orders : [];

    return {
      date,
      orderCount: dayOrders.length,
      orders: dayOrders,
    };
  }),
};

export const orderCalendarOptionLines: OrderCalendarOptionLine[] = [
  { label: "디자인", value: "2호 (18cm/높이 7cm)", price: "+ 45,000원 ~" },
  { label: "모양", value: "사각", price: "+ 3,000원" },
  { label: "케이크 맛", value: "초코시트 + 생크림", price: "+ 3,000원" },
  { label: "포장 방식", value: "보닝백 포장", price: "+ 4,000원" },
  { label: "기타 요청사항", value: "이렇게 만들어주세요", price: "+ 12,000원" },
];

export const sellerOrderDetailFixture: SellerOrderDetailResponse = {
  order: {
    id: ids.order1,
    storeId: ids.store,
    buyerUserId: ids.buyer1,
    inquiryId: ids.inquiry,
    confirmationId: ids.confirmation,
    orderNumber: "ORD-20260812-001",
    menuName: "플라워 케이크",
    optionSummary: JSON.stringify(orderCalendarOptionLines),
    paidAmount: 64000,
    pickupAt: "2026-08-19T06:00:00Z",
    status: "PAID",
    cancelRequestedAt: null,
    cancelReason: null,
    createdAt: "2026-08-17T06:12:00Z",
    updatedAt: "2026-08-17T06:12:00Z",
  },
  paymentAttempt: null,
  refunds: [],
};
