import { useQuery } from "@tanstack/react-query";
import {
  getCurrentOnboarding,
  searchOnboardingLocations,
} from "@/features/onboarding/api/onboarding-api";
import { onboardingKeys } from "@/features/onboarding/api/onboarding-keys";

export function useCurrentOnboardingQuery(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.current(),
    queryFn: getCurrentOnboarding,
    enabled,
  });
}

export function useOnboardingLocationSearchQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: onboardingKeys.locationSearch(normalizedQuery),
    queryFn: () => searchOnboardingLocations(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    retry: false,
  });
}
