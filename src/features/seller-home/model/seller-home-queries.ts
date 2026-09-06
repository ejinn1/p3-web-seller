"use client";

import { useQuery } from "@tanstack/react-query";
import { getSellerHomeDashboard } from "@/features/seller-home/api/seller-home-api";
import { sellerHomeDashboardFixture } from "@/features/seller-home/model/seller-home-fixtures";
import { sellerHomeKeys } from "@/features/seller-home/model/seller-home-keys";

const useFixtures =
  process.env.NEXT_PUBLIC_P3_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_P3_API_BASE_URL;

export function useSellerHomeDashboardQuery() {
  return useQuery({
    queryKey: sellerHomeKeys.dashboard(),
    queryFn: getSellerHomeDashboard,
    initialData: useFixtures ? sellerHomeDashboardFixture : undefined,
  });
}
