import type { ReactNode } from "react";

import { OnboardingRouteGuard } from "@/features/onboarding/ui/onboarding-route-guard";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OnboardingRouteGuard>{children}</OnboardingRouteGuard>;
}
