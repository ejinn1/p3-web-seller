import { syncCurrentUser } from "@/features/auth/api/auth-api";
import type { UserSync } from "@/features/auth/model/types";
import { getCurrentOnboarding } from "@/features/onboarding/api/onboarding-api";
import { getStore } from "@/features/store/api/store-api";
import { ApiError } from "@/lib/api/types";

export const BUYER_HOME_URL = "https://wihada.com";

export async function resolveAuthenticatedEntryRoute(user?: UserSync) {
  const currentUser = user ?? (await syncCurrentUser());

  if (
    !currentUser.registered ||
    currentUser.registrationRequired ||
    currentUser.nextRoute === "ROLE_SELECTION"
  ) {
    return "/auth/role";
  }

  if (currentUser.role === "BUYER") {
    return BUYER_HOME_URL;
  }

  if (currentUser.role === "OPERATOR") {
    return "/admin";
  }

  const store = await getStore().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  });

  if (store) {
    return store.status === "ACTIVE"
      ? "/seller/home"
      : "/seller/store-management";
  }

  const onboarding = await getCurrentOnboarding().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  });

  if (!onboarding) {
    return "/onboarding";
  }

  if (onboarding.status === "PENDING" || onboarding.status === "HELD") {
    return "/onboarding/pending";
  }

  if (onboarding.status === "REJECTED") {
    return "/onboarding/rejected";
  }

  return "/seller/store-management";
}
