import { getJson, sendJson } from "@/lib/api/client";
import type {
  CurrentSellerOnboarding,
  OnboardingLocationSearchResult,
  SellerOnboarding,
  SellerOnboardingInput,
} from "@/features/onboarding/model/types";

export const getCurrentOnboarding = () =>
  getJson<CurrentSellerOnboarding>("/seller/onboardings/current");

export const searchOnboardingLocations = (query: string) =>
  getJson<OnboardingLocationSearchResult>(
    `/seller/store/locations/search?query=${encodeURIComponent(query)}`,
  );

export const createOnboarding = (input: SellerOnboardingInput) =>
  sendJson<SellerOnboarding>("/seller/onboardings", "POST", input);

export const resubmitOnboarding = ({
  onboardingId,
  ...input
}: SellerOnboardingInput & { onboardingId: string }) =>
  sendJson<SellerOnboarding>(
    `/seller/onboardings/${onboardingId}/resubmissions`,
    "POST",
    input,
  );
