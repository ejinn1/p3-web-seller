export type SellerSidebarNavigationGroup = {
  items: Array<{
    disabled?: boolean;
    href: string;
    label: string;
    requiresStoreSetupComplete?: boolean;
  }>;
  title: string;
};

export const sellerSidebarNavigation: SellerSidebarNavigationGroup[] = [
  {
    items: [
      { href: "/seller/home", label: "홈", requiresStoreSetupComplete: true },
      { href: "/seller/store-management", label: "스토어 관리" },
    ],
    title: "스토어",
  },
  {
    items: [
      { href: "/seller/inquiries", label: "내 상담", requiresStoreSetupComplete: true },
      { href: "/seller/orders", label: "주문 내역", requiresStoreSetupComplete: true },
      { href: "/seller/orders/calendar", label: "주문 캘린더", requiresStoreSetupComplete: true },
    ],
    title: "주문",
  },
  {
    items: [{ href: "/seller/revenue", label: "매출분석", requiresStoreSetupComplete: true }],
    title: "정산",
  },
  {
    items: [{ href: "/seller/account-settings", label: "계정 설정", requiresStoreSetupComplete: true }],
    title: "계정",
  },
];
