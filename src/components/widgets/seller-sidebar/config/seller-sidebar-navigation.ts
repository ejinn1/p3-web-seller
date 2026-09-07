export type SellerSidebarNavigationGroup = {
  items: Array<{
    href: string;
    label: string;
  }>;
  title: string;
};

export const sellerSidebarNavigation: SellerSidebarNavigationGroup[] = [
  {
    items: [
      { href: "/seller/home", label: "홈" },
      { href: "/seller/store-management", label: "스토어 관리" },
    ],
    title: "스토어",
  },
  {
    items: [
      { href: "/seller/inquiries", label: "내 상담" },
      { href: "/seller/orders", label: "주문 내역" },
      { href: "/seller/orders/calendar", label: "주문 캘린더" },
    ],
    title: "주문",
  },
  {
    items: [{ href: "/seller/revenue", label: "매출분석" }],
    title: "정산",
  },
  {
    items: [{ href: "/seller/account-settings", label: "계정 설정" }],
    title: "계정",
  },
];
