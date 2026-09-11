import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSettlementAccount } from "@/features/settlement-account/api/settlement-account-api";
import { settlementAccountKeys } from "@/features/settlement-account/model/settlement-account-keys";
import { storeKeys } from "@/features/store/model/store-keys";

export function useSaveSettlementAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSettlementAccount,
    onSuccess: async (account) => {
      queryClient.setQueryData(settlementAccountKeys.detail(), account);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeKeys.managementStatus(),
        }),
        queryClient.invalidateQueries({ queryKey: storeKeys.detail() }),
      ]);
    },
  });
}
