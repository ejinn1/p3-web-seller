import { sellerHomeDashboardFixture } from "@/features/seller-home/model/seller-home-fixtures";
import type {
  SellerDashboardOrderStatus,
  SellerDashboardResponse,
  SellerDashboardTodayOrder,
  SellerHomeDashboard,
  SellerHomeInquiry,
  SellerHomeOrderStatus,
  SellerHomePickup,
} from "@/features/seller-home/model/seller-home-types";
import type {
  InquiryListItem,
  InquiryStatus,
} from "@/features/inquiries/model/inquiry-types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
export const SELLER_HOME_WAITING_INQUIRY_STATUS =
  "WAITING" satisfies InquiryStatus;

export function toSellerHomeDashboard(
  response: SellerDashboardResponse,
  inquiries: InquiryListItem[],
): SellerHomeDashboard {
  const todayPickups = response.todayOrders.map(toSellerHomePickup);

  return {
    ...sellerHomeDashboardFixture,
    dateLabel: formatKoreanDate(response.today),
    dateCells: buildWeekDateCells(response.weekStartDate, response.today),
    todayPickupCount: response.todayOrderCount,
    waitingInquiryCount: response.unansweredInquiryCount,
    weekDays: weekdays,
    pickups: todayPickups,
    inquiries: inquiries
      .filter(isSellerHomeWaitingInquiry)
      .map(toSellerHomeInquiry),
  };
}

export function isSellerHomeWaitingInquiry(inquiry: InquiryListItem) {
  return inquiry.status === SELLER_HOME_WAITING_INQUIRY_STATUS;
}

function toSellerHomePickup(order: SellerDashboardTodayOrder): SellerHomePickup {
  return {
    id: order.orderId,
    inquiryId: order.inquiryId,
    pickupDate: order.pickupDate,
    pickupTime: formatPickupTime(order.pickupTime, order.pickupAt),
    customerName: "고객",
    customerMaskedName: "고객 님",
    totalPrice: order.paidAmount,
    imageUrl: null,
    status: toHomeOrderStatus(order.status),
  };
}

function toSellerHomeInquiry(inquiry: InquiryListItem): SellerHomeInquiry {
  return {
    id: inquiry.id,
    customerMaskedName: inquiry.buyerName,
    previewMessage: inquiry.lastMessage,
    sentAt: inquiry.lastMessageTimeLabel,
    unreadCount: inquiry.unreadCount,
    hasOrderForm: inquiry.hasOrderFormSubmission,
  };
}

function toHomeOrderStatus(
  status: SellerDashboardOrderStatus,
): SellerHomeOrderStatus {
  if (status === "PAID") {
    return "PICKUP_READY";
  }

  if (status === "PICKED_UP") {
    return "PAYMENT_COMPLETE";
  }

  if (status === "REFUND_REQUESTED") {
    return "REFUND_REQUESTED";
  }

  if (status === "REFUNDED") {
    return "REFUNDED";
  }

  return "REVISION_REQUESTED";
}

function buildWeekDateCells(weekStartDate: string, today: string) {
  const weekStart = parseLocalDate(weekStartDate);
  const todayDate = parseLocalDate(today);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const isoDate = toIsoDate(date);

    return {
      date: isoDate,
      label: String(date.getDate()),
      disabled: date.getTime() < todayDate.getTime(),
      selected: isoDate === today,
    };
  });
}

function formatKoreanDate(value: string) {
  const date = parseLocalDate(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatPickupTime(pickupTime: string, pickupAt: string) {
  const [rawHour, rawMinute] = pickupTime.split(":");
  const hour = Number(rawHour);

  if (Number.isFinite(hour)) {
    return toPeriodTime(hour, rawMinute ?? "00");
  }

  return formatTime(pickupAt);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function toPeriodTime(hour: number, minute: string) {
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour;

  return `${period} ${String(displayHour).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function toIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
