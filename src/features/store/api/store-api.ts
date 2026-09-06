import { getJson, sendJson } from "@/lib/api/client";
import type {
  Store,
  StoreInput,
  StoreLocationSearchResult,
  StoreManagementStatus,
  StoreSettings,
  StoreSettingsInput,
  StoreShareLink,
  StoreStatus,
} from "@/features/store/model/store-types";

export const getStore = () => getJson<Store>("/seller/store");
export const getStoreManagementStatus = () =>
  getJson<StoreManagementStatus>("/seller/store/management-status");
export const createStore = (input: StoreInput) =>
  sendJson<Store>("/seller/store", "POST", input);
export const updateStore = (input: StoreInput) =>
  sendJson<Store>("/seller/store", "PATCH", input);
export const updateStoreStatus = (status: StoreStatus) =>
  sendJson<Store>("/seller/store/status", "PATCH", { status });
export const deleteStore = () => sendJson<void>("/seller/store", "DELETE");

export const getStoreSettings = () =>
  getJson<StoreSettings>("/seller/store/settings");
export const updateStoreSettings = (input: StoreSettingsInput) =>
  sendJson<StoreSettings>("/seller/store/settings", "PUT", input);
export const getStoreShareLink = () =>
  getJson<StoreShareLink>("/seller/store/share-link");
export const searchStoreLocations = (query: string) =>
  getJson<StoreLocationSearchResult>(
    `/seller/store/locations/search?query=${encodeURIComponent(query)}`,
  );
