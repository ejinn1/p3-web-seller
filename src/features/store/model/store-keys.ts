export const storeKeys = {
  all: ["store"] as const,
  detail: () => [...storeKeys.all, "detail"] as const,
  managementStatus: () => [...storeKeys.all, "management-status"] as const,
  settings: () => [...storeKeys.all, "settings"] as const,
  shareLink: () => [...storeKeys.all, "share-link"] as const,
  businessHours: () => [...storeKeys.all, "business-hours"] as const,
  locationSearch: (query: string) =>
    [...storeKeys.all, "location-search", query] as const,
};
