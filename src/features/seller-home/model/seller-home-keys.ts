export const sellerHomeKeys = {
  all: ["seller-home"] as const,
  dashboard: () => [...sellerHomeKeys.all, "dashboard"] as const,
};
