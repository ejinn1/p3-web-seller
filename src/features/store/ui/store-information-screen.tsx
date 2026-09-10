"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useUpdateStoreDescriptionMutation } from "@/features/store/model/store-mutations";
import { useStoreQuery } from "@/features/store/model/store-queries";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

import { StoreBusinessHoursScreen } from "./store-business-hours-screen";
import { StoreInformationForm } from "./store-information-form";
import { StoreRefundPeriodScreen } from "./store-refund-period-screen";

type StoreInformationView = "information" | "business-hours" | "refund-period";

export function StoreInformationScreen() {
  const router = useRouter();
  const storeQuery = useStoreQuery();
  const updateStoreDescriptionMutation = useUpdateStoreDescriptionMutation();
  const [view, setView] = useState<StoreInformationView>("information");
  const [refundPeriod, setRefundPeriod] = useState<string | null>(null);

  if (view === "business-hours") {
    return <StoreBusinessHoursScreen onBack={() => setView("information")} />;
  }

  if (view === "refund-period") {
    return (
      <StoreRefundPeriodScreen
        onBack={() => setView("information")}
        onConfirm={(summary) => {
          setRefundPeriod(summary);
          setView("information");
        }}
      />
    );
  }

  return (
    <StoreInformationForm
      descriptionSaveError={
        updateStoreDescriptionMutation.isError
          ? "매장 소개를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : undefined
      }
      isDescriptionSaving={updateStoreDescriptionMutation.isPending}
      key={storeQuery.data?.id ?? "new"}
      onDescriptionSaved={() =>
        router.push(getSellerBackHref("storeInformation"))
      }
      onDescriptionSave={async (description) => {
        await updateStoreDescriptionMutation.mutateAsync({ description });
      }}
      storeAddress={storeQuery.data?.address}
      refundPeriod={refundPeriod ?? storeQuery.data?.cancellationRefundPolicy}
      store={storeQuery.data}
      storeQueryIsError={storeQuery.isError}
      onBusinessHoursClick={() => setView("business-hours")}
      onRefundPeriodClick={() => setView("refund-period")}
    />
  );
}
