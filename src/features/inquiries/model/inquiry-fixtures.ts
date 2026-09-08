import type {
  InquiryDetail,
  InquiryListItem,
} from "@/features/inquiries/model/inquiry-types";

const sharedLastMessage =
  "안녕하세요. 주문 감사합니다! ☺️ 케이크 레터링 색감은 원하시는 색 사진 넣어주시면 최대한 비슷하게 만들어 주고 있습니다!";

export const inquiryListFixture: InquiryListItem[] = [
  {
    id: "inquiry-001",
    buyerName: "김OO",
    hasOrderFormSubmission: true,
    lastMessage: sharedLastMessage,
    lastMessageAt: "2026-08-14T16:52:00+09:00",
    lastMessageTimeLabel: "오후 4:52",
    status: "WAITING",
    unreadCount: 1,
    profileImageUrl: "/inquiries/profile-faucet.png",
  },
  {
    id: "inquiry-002",
    buyerName: "이동후",
    hasOrderFormSubmission: false,
    lastMessage: "Placeholder",
    lastMessageAt: "2026-08-14T16:52:00+09:00",
    lastMessageTimeLabel: "오후 4:52",
    status: "WAITING",
    unreadCount: 0,
    profileImageUrl: null,
  },
  {
    id: "inquiry-003",
    buyerName: "Placeholder",
    hasOrderFormSubmission: false,
    lastMessage: "Placeholder",
    lastMessageAt: "2026-08-14T16:52:00+09:00",
    lastMessageTimeLabel: "오후 4:52",
    status: "IN_PROGRESS",
    unreadCount: 0,
    profileImageUrl: "/inquiries/profile-faucet.png",
  },
];

export const inquiryDetailFixture: InquiryDetail = {
  id: "inquiry-001",
  buyerName: "이동후",
  chatInfo: "픽업만 가능 · 월~일 오후 12:00–17:00",
  participantUserId: null,
  profileImageUrl: "/inquiries/profile-faucet.png",
  status: "WAITING",
  statusLabel: "접수대기",
  order: {
    buyerName: "이동후",
    buyerPhone: "010-0000-0000",
    imageUrl: "/inquiries/cake-attachment.png",
    pickupDate: "8월 19일 수요일",
    pickupTime: "오후 3:30",
    totalPrice: 64000,
    options: [
      {
        id: "size",
        label: "사이즈",
        value: "2호 (18cm/높이 7cm)",
        priceText: "+ 45000원 ~",
        required: true,
      },
      {
        id: "shape",
        label: "모양",
        value: "사각",
        priceText: "+ 3000원",
        required: true,
      },
      {
        id: "flavor",
        label: "케이크 맛",
        value: "초코시트 + 생크림",
        priceText: "+ 3000원",
      },
      {
        id: "packaging",
        label: "포장 방식",
        value: "보닝백 포장",
        priceText: "+ 4000원",
        required: true,
      },
      {
        id: "design",
        label: "케이크 디자인",
        value: "사진첨부",
        priceText: "+ 12000원",
        needsPrice: true,
      },
      {
        id: "extra",
        label: "기타 요청사항",
        value: "생화 추가",
        priceText: "+ 10000원",
        needsPrice: true,
      },
    ],
  },
  messages: [
    {
      id: "m-001",
      kind: "order-request",
      owner: "buyer",
      sentAt: "오후 6:20분",
    },
    {
      id: "m-002",
      kind: "notice",
      text: "8월 14일 16:40분 주문이 접수되었습니다.",
    },
  ],
};
