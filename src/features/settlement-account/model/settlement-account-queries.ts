import { useQuery } from "@tanstack/react-query";
import {
  getSettlementAccount,
  getSettlementBanks,
} from "@/features/settlement-account/api/settlement-account-api";
import { settlementAccountKeys } from "@/features/settlement-account/model/settlement-account-keys";

export function useSettlementBanksQuery() {
  return useQuery({
    queryKey: settlementAccountKeys.banks(),
    queryFn: getSettlementBanks,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSettlementAccountQuery() {
  return useQuery({
    queryKey: settlementAccountKeys.detail(),
    queryFn: getSettlementAccount,
  });
}
