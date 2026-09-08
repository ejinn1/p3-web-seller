export const noticeCategories = [
  {
    label: "픽업 안내",
    slug: "pickup-delivery",
    type: "PICKUP_DELIVERY",
  },
  {
    label: "디자인 제작 안내",
    slug: "design-production",
    type: "DESIGN_PRODUCTION",
  },
  { label: "결제 안내", slug: "payment", type: "PAYMENT" },
  { label: "케이크 관리 안내", slug: "cake-care", type: "CAKE_CARE" },
  { label: "영업시간 안내", slug: "business-hours", type: "BUSINESS_HOURS" },
] as const;

export type NoticeCategory = (typeof noticeCategories)[number];
export type NoticeCategorySlug = NoticeCategory["slug"];
export type NoticeType = NoticeCategory["type"];

export function getNoticeCategory(slug: string) {
  return noticeCategories.find((category) => category.slug === slug);
}
