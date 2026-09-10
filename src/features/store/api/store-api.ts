import { getJson, sendJson } from "@/lib/api/client";
import type {
  SellerProfileImage,
  SellerProfileImageInput,
  Store,
  StoreBusinessHours,
  StoreBusinessHoursInput,
  StoreDescriptionInput,
  StoreInput,
  StoreManagementStatus,
  StoreRefundPolicy,
  StoreRefundPolicyInput,
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
export const updateStoreStatus = (status: StoreStatus) =>
  sendJson<Store>("/seller/store/status", "PATCH", { status });
export const deleteStore = () => sendJson<void>("/seller/store", "DELETE");
export const updateSellerProfileImage = (input: SellerProfileImageInput) =>
  sendJson<SellerProfileImage>(
    "/seller/store/profile-image",
    "PATCH",
    input,
  );

export const getStoreSettings = () =>
  getJson<StoreSettings>("/seller/store/settings");
export const updateStoreSettings = (input: StoreSettingsInput) =>
  sendJson<StoreSettings>("/seller/store/settings", "PUT", input);
export const getStoreShareLink = () =>
  getJson<StoreShareLink>("/seller/store/share-link");
export const getStoreBusinessHours = () =>
  getJson<StoreBusinessHours>("/seller/store/business-hours");
export const updateStoreBusinessHours = (input: StoreBusinessHoursInput) =>
  sendJson<StoreBusinessHours>("/seller/store/business-hours", "PUT", input);
export const updateStoreDescription = (input: StoreDescriptionInput) =>
  sendJson<Store>("/seller/store/description", "PUT", input);
export const completeAccountRegistration = () =>
  sendJson<Store>("/seller/store/account-registration/complete", "POST");
export const getStoreRefundPolicy = () =>
  getJson<StoreRefundPolicy>("/seller/store/refund-policy");
export const updateStoreRefundPolicy = (input: StoreRefundPolicyInput) =>
  sendJson<StoreRefundPolicy>("/seller/store/refund-policy", "PUT", input);
