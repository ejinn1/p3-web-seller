"use client";

import { useState } from "react";
import { Button } from "@/components/common/button";
import { SellerMenuHeader } from "@/components/widgets/seller-menu-header";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { getSettlementAccountErrorMessage } from "@/features/settlement-account/model/settlement-account-error";
import { useSaveSettlementAccountMutation } from "@/features/settlement-account/model/settlement-account-mutations";
import {
  useSettlementAccountQuery,
  useSettlementBanksQuery,
} from "@/features/settlement-account/model/settlement-account-queries";
import type { SettlementAccountInput } from "@/features/settlement-account/model/settlement-account-types";
import { SettlementAccountForm } from "@/features/settlement-account/ui/settlement-account-form";
import { SettlementAccountSummary } from "@/features/settlement-account/ui/settlement-account-summary";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function SellerSettlementAccountScreen() {
  const [isChanging, setIsChanging] = useState(false);
  const banksQuery = useSettlementBanksQuery();
  const accountQuery = useSettlementAccountQuery();
  const saveMutation = useSaveSettlementAccountMutation();
  const account = accountQuery.data;
  const isLoading = banksQuery.isLoading || accountQuery.isLoading;
  const loadError = banksQuery.error ?? accountQuery.error;
  const showForm = account === null || isChanging;

  const save = async (input: SettlementAccountInput) => {
    await saveMutation.mutateAsync(input);
    setIsChanging(false);
  };

  return (
    <SellerResponsiveFrame>
      <SellerMenuHeader
        backHref={getSellerBackHref("settlementAccount")}
        backLabel="스토어 관리로 돌아가기"
        className="border-none"
        title="정산계좌 등록"
      />

      {isLoading ? (
        <div
          aria-live="polite"
          className="flex flex-1 items-center justify-center text-seller-body-md text-text-secondary"
        >
          계좌정보를 불러오고 있어요.
        </div>
      ) : loadError ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-seller-body-md text-text-secondary">
            {getSettlementAccountErrorMessage(loadError)}
          </p>
          <Button
            onClick={() =>
              void Promise.all([banksQuery.refetch(), accountQuery.refetch()])
            }
            variant="secondary"
          >
            다시 시도
          </Button>
        </section>
      ) : account && !showForm ? (
        <SettlementAccountSummary
          account={account}
          onChange={() => {
            saveMutation.reset();
            setIsChanging(true);
          }}
        />
      ) : (
        <SettlementAccountForm
          account={account}
          banks={banksQuery.data ?? []}
          errorMessage={
            saveMutation.isError
              ? getSettlementAccountErrorMessage(saveMutation.error)
              : null
          }
          isPending={saveMutation.isPending}
          onSubmit={save}
        />
      )}
    </SellerResponsiveFrame>
  );
}
