"use client";

import { useQuery } from "@tanstack/react-query";
import { getSellerRevenue } from "@/features/revenue/api/revenue-api";
import { revenueFixture } from "@/features/revenue/model/revenue-fixtures";
import { revenueKeys } from "@/features/revenue/model/revenue-keys";

export function useSellerRevenueQuery(startDate: string, endDate: string) {
  return useQuery({
    queryKey: revenueKeys.range(startDate, endDate),
    queryFn: () => getSellerRevenue(startDate, endDate),
    enabled: Boolean(process.env.NEXT_PUBLIC_P3_API_BASE_URL),
    initialData: revenueFixture,
  });
}
