import { getSellerInquiries } from "@/features/inquiries/api/inquiries-api";
import {
  SELLER_HOME_WAITING_INQUIRY_STATUS,
  toSellerHomeDashboard,
} from "@/features/seller-home/model/seller-home-adapters";
import { sellerHomeDashboardFixture } from "@/features/seller-home/model/seller-home-fixtures";
import type {
  SellerDashboardResponse,
  SellerHomeDashboard,
} from "@/features/seller-home/model/seller-home-types";
import { getJson } from "@/lib/api/client";

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export async function getSellerHomeDashboard(): Promise<SellerHomeDashboard> {
  if (useFixtures) {
    return sellerHomeDashboardFixture;
  }

  const [dashboard, inquiries] = await Promise.all([
    getJson<SellerDashboardResponse>("/seller/dashboard"),
    getSellerInquiries({
      status: SELLER_HOME_WAITING_INQUIRY_STATUS,
      unreadOnly: true,
    }),
  ]);

  return toSellerHomeDashboard(dashboard, inquiries);
}
