export const SELLER_ENTRY_ROUTE = "/seller";
export const SELLER_HOME_ROUTE = "/seller/home";
export const SELLER_STORE_MANAGEMENT_ROUTE = "/seller/store-management";

export const sellerBackRoutePolicy = {
  accountSettings: SELLER_HOME_ROUTE,
  inquiries: SELLER_HOME_ROUTE,
  inquiryDetail: "/seller/inquiries",
  notice: SELLER_STORE_MANAGEMENT_ROUTE,
  noticeCategory: "/seller/notice",
  noticePreview: "/seller/notice",
  onboarding: SELLER_ENTRY_ROUTE,
  orderCalendar: SELLER_HOME_ROUTE,
  orderCalendarDetail: "/seller/orders/calendar",
  orderCalendarList: "/seller/orders/calendar",
  orderDetail: "/seller/orders",
  orderForm: SELLER_STORE_MANAGEMENT_ROUTE,
  orderFormCategory: "/seller/order-form",
  orderFormPreview: "/seller/order-form",
  orders: SELLER_HOME_ROUTE,
  photoGallery: "/seller/photo-registration/representative",
  photoRepresentative: SELLER_STORE_MANAGEMENT_ROUTE,
  revenue: SELLER_HOME_ROUTE,
  revenueDetail: "/seller/revenue",
  settlementAccount: SELLER_STORE_MANAGEMENT_ROUTE,
  storeInformation: SELLER_STORE_MANAGEMENT_ROUTE,
  storeManagement: SELLER_HOME_ROUTE,
} as const;

export type SellerBackRouteKey = keyof typeof sellerBackRoutePolicy;

export function getSellerBackHref(key: SellerBackRouteKey) {
  return sellerBackRoutePolicy[key];
}

export function getSellerStoreManagementBackHref(canEnterSellerHome: boolean) {
  return canEnterSellerHome
    ? getSellerBackHref("storeManagement")
    : "/auth/role";
}
