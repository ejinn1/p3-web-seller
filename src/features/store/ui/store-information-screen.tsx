"use client";

import { useState } from "react";

import { useUpdateStoreMutation } from "@/features/store/model/store-mutations";
import { useStoreQuery } from "@/features/store/model/store-queries";
import type { Store, StoreInput } from "@/features/store/model/store-types";

import { PickupLocationDetailScreen } from "./pickup-location-detail-screen";
import { PickupLocationSearchScreen } from "./pickup-location-search-screen";
import { StoreBusinessHoursScreen } from "./store-business-hours-screen";
import { StoreInformationForm } from "./store-information-form";
import { StoreRefundPeriodScreen } from "./store-refund-period-screen";

type StoreInformationView =
  | "information"
  | "pickup-location-detail"
  | "pickup-location-search"
  | "business-hours"
  | "refund-period";

function toStoreInput(store: Store, address: string): StoreInput {
  return {
    name: store.name,
    profileAssetId: store.profileAssetId,
    description: store.description,
    contact: store.contact,
    contactVisible: store.contactVisible,
    snsLinks: store.snsLinks,
    businessHours: store.businessHours,
    pickupSettings: store.pickupSettings,
    address,
  };
}

export function StoreInformationScreen() {
  const storeQuery = useStoreQuery();
  const updateStoreMutation = useUpdateStoreMutation();
  const [view, setView] = useState<StoreInformationView>("information");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState<string | null>(null);
  const [refundPeriod, setRefundPeriod] = useState<string | null>(null);

  const address =
    selectedAddress || pickupAddress || storeQuery.data?.address || "";

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

  if (view === "pickup-location-search") {
    return (
      <PickupLocationSearchScreen
        onBack={() => setView("pickup-location-detail")}
        onSelect={(nextAddress) => {
          setSelectedAddress(nextAddress);
          setView("pickup-location-detail");
        }}
      />
    );
  }

  if (view === "pickup-location-detail") {
    return (
      <PickupLocationDetailScreen
        address={address}
        onBack={() => setView("information")}
        onConfirm={async (nextPickupAddress) => {
          if (!storeQuery.data) {
            return;
          }

          try {
            const updatedStore = await updateStoreMutation.mutateAsync(
              toStoreInput(storeQuery.data, nextPickupAddress),
            );

            setPickupAddress(updatedStore.address ?? nextPickupAddress);
            setSelectedAddress("");
            setView("information");
          } catch {
            // The mutation state is rendered on the current screen.
          }
        }}
        onSearch={() => setView("pickup-location-search")}
        isSaving={updateStoreMutation.isPending}
        saveError={
          updateStoreMutation.isError
            ? "픽업 장소를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
            : undefined
        }
      />
    );
  }

  return (
    <StoreInformationForm
      pickupAddress={pickupAddress || storeQuery.data?.address}
      refundPeriod={refundPeriod}
      store={storeQuery.data}
      storeQueryIsError={storeQuery.isError}
      onBusinessHoursClick={() => setView("business-hours")}
      onPickupLocationClick={() => setView("pickup-location-detail")}
      onRefundPeriodClick={() => setView("refund-period")}
    />
  );
}
