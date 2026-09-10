import type { OnboardingLocation } from "@/features/onboarding/model/types";

const STORAGE_KEY = "p3:seller:onboarding:recent-locations";
const MAX_RECENT_LOCATIONS = 2;

export function readRecentOnboardingLocations(): OnboardingLocation[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isOnboardingLocation).slice(0, MAX_RECENT_LOCATIONS);
  } catch {
    return [];
  }
}

export function saveRecentOnboardingLocation(
  location: OnboardingLocation,
): OnboardingLocation[] {
  const next = [
    location,
    ...readRecentOnboardingLocations().filter(
      (item) => item.address !== location.address,
    ),
  ].slice(0, MAX_RECENT_LOCATIONS);

  writeRecentOnboardingLocations(next);
  return next;
}

export function removeRecentOnboardingLocation(
  address: string,
): OnboardingLocation[] {
  const next = readRecentOnboardingLocations().filter(
    (item) => item.address !== address,
  );
  writeRecentOnboardingLocations(next);
  return next;
}

function writeRecentOnboardingLocations(locations: OnboardingLocation[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  } catch {
    // Keep the location flow usable when browser storage is unavailable.
  }
}

function isOnboardingLocation(value: unknown): value is OnboardingLocation {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.address === "string" &&
    typeof candidate.buildingName === "string" &&
    typeof candidate.jibunAddress === "string" &&
    typeof candidate.zipCode === "string"
  );
}
