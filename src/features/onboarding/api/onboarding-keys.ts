export const onboardingKeys = {
  all: ["seller-onboarding"] as const,
  current: () => [...onboardingKeys.all, "current"] as const,
  locationSearch: (query: string) =>
    [...onboardingKeys.all, "location-search", query] as const,
};
