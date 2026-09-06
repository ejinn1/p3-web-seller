"use client";

import { useState } from "react";

import { useStoreQuery } from "@/features/store/model/store-queries";

import { PickupLocationDetailScreen } from "./pickup-location-detail-screen";
import { PickupLocationSearchScreen } from "./pickup-location-search-screen";
import { StoreInformationForm } from "./store-information-form";

type StoreInformationView =
  "information" | "pickup-location-detail" | "pickup-location-search";

export function StoreInformationScreen() {
  const storeQuery = useStoreQuery();
  const [view, setView] = useState<StoreInformationView>("information");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState<string | null>(null);

  const address =
    selectedAddress || pickupAddress || storeQuery.data?.address || "";

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
        onConfirm={(nextPickupAddress) => {
          setPickupAddress(nextPickupAddress);
          setSelectedAddress("");
          setView("information");
        }}
        onSearch={() => setView("pickup-location-search")}
      />
    );
  }

  return (
    <StoreInformationForm
      pickupAddress={pickupAddress || storeQuery.data?.address}
      store={storeQuery.data}
      storeQueryIsError={storeQuery.isError}
      onPickupLocationClick={() => setView("pickup-location-detail")}
    />
  );
}
