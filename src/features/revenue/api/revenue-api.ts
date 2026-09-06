import { getJson } from "@/lib/api/client";
import type { SellerRevenueResponse } from "@/features/revenue/model/revenue-types";

export function getSellerRevenue(startDate: string, endDate: string) {
  const searchParams = new URLSearchParams({ startDate, endDate });

  return getJson<SellerRevenueResponse>(
    `/seller/dashboard/revenue?${searchParams.toString()}`,
  );
}
