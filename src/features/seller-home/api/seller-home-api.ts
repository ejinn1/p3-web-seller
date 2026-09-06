import { sellerHomeDashboardFixture } from "@/features/seller-home/model/seller-home-fixtures";
import type { SellerHomeDashboard } from "@/features/seller-home/model/seller-home-types";

export async function getSellerHomeDashboard(): Promise<SellerHomeDashboard> {
  return sellerHomeDashboardFixture;
}
