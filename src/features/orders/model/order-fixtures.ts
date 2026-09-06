import type {
  SellerOrderDetail,
  SellerOrderListItem,
  SellerOrderViewModel,
} from "@/features/orders/model/order-types";

const storeId = "4bd7da7d-97f0-4ba1-a6f3-bcff4f6fbffc";
const confirmationId = "80a4f582-4c0f-45ef-a4d1-9f2d9a973acf";
const paymentAttemptId = "35c98ffc-7813-4ca8-806a-3d322d6d5e65";

const viewModels: SellerOrderViewModel[] = [
  {
    id: "8d6f7165-4cd9-4eb8-a0c6-7c4b5360d201",
    storeId,
    buyerUserId: "ed58abcf-f746-4cc7-8af8-08cc018af3c9",
    inquiryId: "50452aac-0aa2-4cb4-b7ec-8c17152fbf5c",
    confirmationId,
    orderNumber: "P3-20260817-0001",
    menuName: "2호 (18cm/높이 7cm)",
    optionSummary: "초코시트 + 생크림",
    startReferenceAssets: ["d684158d-76a5-4f76-a0ee-dfdf18e13887"],
    paidAmount: 64000,
    pickupAt: "2026-08-19T14:00:00+09:00",
    status: "PAID",
    cancelRequestedAt: null,
    cancelReason: null,
    createdAt: "2026-08-11T15:12:00+09:00",
    updatedAt: "2026-08-11T15:12:00+09:00",
    buyerName: "김지현",
    detailBuyerName: "이동후",
    detailPaymentText: "2026년 8월 17일 오후 03:12",
    detailPickupText: "2026년 8월 19일 오후 3시00",
    detailRows: [
      {
        label: "디자인",
        value: "2호 (18cm/높이 7cm)",
        price: 45000,
        priceText: "+ 45,000원 ~",
      },
      { label: "모양", value: "사각", price: 3000 },
      { label: "케이크 맛", value: "초코시트 + 생크림", price: 3000 },
      { label: "포장 방식", value: "보닝백 포장", price: 4000 },
      { label: "기타 요청사항", value: "이렇게 만들어주세요", price: 12000 },
    ],
    selectedRows: [
      {
        label: "사이즈",
        value: "2호 (18cm/높이 7cm)",
        price: 45000,
        priceText: "+ 45000원 ~",
      },
      { label: "모양", value: "사각", price: 3000, priceText: "+ 3000원" },
      {
        label: "케이크 맛",
        value: "초코시트 + 생크림",
        price: 3000,
        priceText: "+ 3000원",
      },
      {
        label: "포장 방식",
        value: "보닝백 포장",
        price: 4000,
        priceText: "+ 4000원",
      },
      {
        label: "케이크 디자인",
        value: "생화 + 12000원 (싯가 반영)",
        price: null,
      },
      { label: "기타 요청사항", value: "잘 부탁드립니다:)", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-box.png",
  },
  {
    id: "152b4d93-c4df-40af-80b3-658ae5ac22fd",
    storeId,
    buyerUserId: "701551d3-99f7-4f0a-8d3a-a42f86b762c3",
    inquiryId: "a7b4fc89-5160-464e-9246-7d915c6c82d9",
    confirmationId: "74457c10-e5f7-498d-883e-ef4866fb3125",
    orderNumber: "P3-20260817-0002",
    menuName: "체리 레터링 케이크",
    optionSummary: "바닐라시트 + 생크림",
    startReferenceAssets: ["f00a711c-86b6-4f10-8513-3fc543471888"],
    paidAmount: 71500,
    pickupAt: "2026-08-19T15:30:00+09:00",
    status: "PICKED_UP",
    cancelRequestedAt: null,
    cancelReason: null,
    createdAt: "2026-08-11T15:52:00+09:00",
    updatedAt: "2026-08-19T15:36:00+09:00",
    buyerName: "박서연",
    detailRows: [
      { label: "디자인", value: "체리 레터링 케이크", price: 52000 },
      { label: "모양", value: "원형", price: 0 },
      { label: "케이크 맛", value: "바닐라시트 + 생크림", price: 3000 },
      { label: "포장 방식", value: "투명 박스 포장", price: 4500 },
      { label: "기타 요청사항", value: "초는 두 개만 챙겨주세요", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-flower.png",
  },
  {
    id: "c5bbdf0b-aa36-4c11-8d40-e368fc2b0aa9",
    storeId,
    buyerUserId: "a18176e8-96f6-4bc8-9479-9bd26f0efeaa",
    inquiryId: "db97755f-f9ec-4392-b9fe-18e560f6d39f",
    confirmationId: "7e2ec14b-3a1b-44a2-a869-fcfeb63a7e22",
    orderNumber: "P3-20260817-0003",
    menuName: "도시락 케이크",
    optionSummary: "말차시트 + 크림치즈",
    startReferenceAssets: ["3d1c823d-5956-4cd9-a28c-156f98fb2b1e"],
    paidAmount: 54000,
    pickupAt: "2026-08-19T18:00:00+09:00",
    status: "CANCEL_REQUESTED",
    cancelRequestedAt: "2026-08-18T10:10:00+09:00",
    cancelReason: "픽업 일정 변경",
    createdAt: "2026-08-11T16:20:00+09:00",
    updatedAt: "2026-08-18T10:10:00+09:00",
    buyerName: "이도현",
    detailRows: [
      { label: "디자인", value: "도시락 케이크", price: 39000 },
      { label: "모양", value: "사각", price: 3000 },
      { label: "케이크 맛", value: "말차시트 + 크림치즈", price: 5000 },
      { label: "기타 요청사항", value: "문구는 가운데에 크게 넣어주세요", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-cherry.png",
  },
  {
    id: "b42eac55-309a-48f0-b979-c818a0be3353",
    storeId,
    buyerUserId: "54a6ed85-b9ad-4f58-b597-8669b3d586e8",
    inquiryId: "a87d4e83-e73a-491d-b32d-a48e8233be33",
    confirmationId: "a35e5ca8-9d91-4d38-b17d-b0f8a95b1d42",
    orderNumber: "P3-20260816-0001",
    menuName: "2호 (18cm/높이 7cm)",
    optionSummary: "초코시트 + 생크림",
    startReferenceAssets: ["32f33b60-d5e1-41c5-8e8a-d00bfda28a0b"],
    paidAmount: 64000,
    pickupAt: "2026-08-18T14:00:00+09:00",
    status: "REFUND_PROCESSING",
    cancelRequestedAt: "2026-08-17T18:21:00+09:00",
    cancelReason: "구매자 요청",
    createdAt: "2026-08-10T15:12:00+09:00",
    updatedAt: "2026-08-17T18:21:00+09:00",
    buyerName: "김지현",
    detailRows: [
      { label: "사이즈", value: "2호 (18cm/높이 7cm)", price: 45000 },
      { label: "모양", value: "원형", price: 0 },
      { label: "기타 요청사항", value: "환불 처리 중인 주문입니다.", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-box.png",
  },
  {
    id: "01fafc84-58cb-42a2-9b27-091424a101b1",
    storeId,
    buyerUserId: "a0ed1fd1-e53c-4501-ad90-f6aa12603835",
    inquiryId: "3766678b-df1b-432d-9d28-1fc191e5f3a1",
    confirmationId: "3268b2e0-4347-413f-b943-bf686d675209",
    orderNumber: "P3-20260816-0002",
    menuName: "체리 레터링 케이크",
    optionSummary: "바닐라시트 + 생크림",
    startReferenceAssets: ["0cde840b-5f10-4db7-bff9-920ba43a39b0"],
    paidAmount: 71500,
    pickupAt: "2026-08-18T15:30:00+09:00",
    status: "REFUNDED",
    cancelRequestedAt: "2026-08-17T09:21:00+09:00",
    cancelReason: "결제 취소",
    createdAt: "2026-08-10T15:52:00+09:00",
    updatedAt: "2026-08-17T10:02:00+09:00",
    buyerName: "박서연",
    detailRows: [
      { label: "디자인", value: "체리 레터링 케이크", price: 52000 },
      { label: "포장 방식", value: "보닝백 포장", price: 4000 },
      { label: "기타 요청사항", value: "환불 완료된 주문입니다.", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-flower.png",
  },
  {
    id: "e87b260a-3930-4886-8ee8-732d5c67a4f5",
    storeId,
    buyerUserId: "552200d8-5d9d-41af-b36a-d588f8e53b5f",
    inquiryId: "bdf2e47c-01da-4878-9b37-f78265b39ee2",
    confirmationId: "3d9dd93b-d606-4bf7-b52e-5c3c9989c133",
    orderNumber: "P3-20260816-0003",
    menuName: "도시락 케이크",
    optionSummary: "말차시트 + 크림치즈",
    startReferenceAssets: ["af60fa02-c43a-4e22-a884-04dd5264e177"],
    paidAmount: 54000,
    pickupAt: "2026-08-18T18:00:00+09:00",
    status: "CANCELED",
    cancelRequestedAt: "2026-08-16T20:30:00+09:00",
    cancelReason: "재료 수급 불가",
    createdAt: "2026-08-10T16:20:00+09:00",
    updatedAt: "2026-08-16T20:30:00+09:00",
    buyerName: "이도현",
    detailRows: [
      { label: "디자인", value: "도시락 케이크", price: 39000 },
      { label: "케이크 맛", value: "말차시트 + 크림치즈", price: 5000 },
      { label: "기타 요청사항", value: "취소된 주문입니다.", price: null },
    ],
    storeName: "위하다",
    thumbnailUrl: "/orders/order-thumb-cherry.png",
  },
];

export const sellerOrderViewFixtures = viewModels;

export const sellerOrderListFixture: SellerOrderListItem[] =
  viewModels.map(viewToListItem);

export const sellerOrderDetailFixture: SellerOrderDetail = {
  order: {
    ...sellerOrderListFixture[0],
  },
  paymentAttempt: {
    paymentAttemptId,
    confirmationId,
    sessionId: "cs_test_202608171512",
    amount: 64000,
    status: "SUCCEEDED",
    failureCode: null,
    createdAt: "2026-08-17T15:10:00+09:00",
    completedAt: "2026-08-17T15:12:00+09:00",
    expiresAt: "2026-08-17T15:40:00+09:00",
    expired: false,
  },
  refunds: [],
};

export const longTextSellerOrderFixture: SellerOrderViewModel = {
  ...viewModels[0],
  id: "7fce1e27-a81e-4e0e-a57c-139884591631",
  buyerName: "김지현아주긴이름테스트고객",
  menuName: "초대형 생화 장식 빈티지 레터링 케이크",
  optionSummary:
    "초코시트 + 생크림 + 생화 + 긴 요청사항이 들어간 주문 옵션",
  detailRows: [
    {
      label: "디자인",
      value: "초대형 생화 장식 빈티지 레터링 케이크와 매우 긴 디자인 설명",
      price: 12000,
    },
    {
      label: "기타 요청사항",
      value:
        "받는 사람이 한눈에 읽을 수 있도록 문구를 가운데에 크게 넣고, 포장 전에 사진을 꼭 보내주세요.",
      price: null,
    },
  ],
};

export const nullStatusSellerOrderFixture: SellerOrderViewModel = {
  ...viewModels[0],
  id: "b2d1608d-961e-42c8-a953-5f192636362b",
  status: null,
};

export function findSellerOrderFixture(orderId: string) {
  const viewModel =
    viewModels.find((order) => order.id === orderId) ?? viewModels[0];

  return {
    detail: {
      ...sellerOrderDetailFixture,
      order: viewToOrder(viewModel),
    },
    viewModel,
  };
}

function viewToOrder(viewModel: SellerOrderViewModel) {
  return {
    buyerUserId: viewModel.buyerUserId,
    cancelReason: viewModel.cancelReason,
    cancelRequestedAt: viewModel.cancelRequestedAt,
    confirmationId: viewModel.confirmationId,
    createdAt: viewModel.createdAt,
    id: viewModel.id,
    inquiryId: viewModel.inquiryId,
    menuName: viewModel.menuName,
    optionSummary: viewModel.optionSummary,
    orderNumber: viewModel.orderNumber,
    paidAmount: viewModel.paidAmount,
    pickupAt: viewModel.pickupAt,
    status: viewModel.status,
    storeId: viewModel.storeId,
    updatedAt: viewModel.updatedAt,
  };
}

function viewToListItem(viewModel: SellerOrderViewModel) {
  return {
    ...viewToOrder(viewModel),
    startReferenceAssets: viewModel.startReferenceAssets,
  };
}
