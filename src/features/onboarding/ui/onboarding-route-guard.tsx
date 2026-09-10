"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { hasCognitoSession } from "@/features/auth/model/cognito";
import { resolveAuthenticatedEntryRoute } from "@/features/auth/model/authenticated-entry-route";

type OnboardingRouteGuardProps = {
  children: ReactNode;
};

export function OnboardingRouteGuard({ children }: OnboardingRouteGuardProps) {
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "allowed" | "error">(
    "checking",
  );

  useEffect(() => {
    let isCancelled = false;

    async function verifyOnboardingAccess() {
      if (!hasCognitoSession()) {
        window.location.replace("/seller");
        return;
      }

      try {
        const nextRoute = await resolveAuthenticatedEntryRoute();

        if (nextRoute !== pathname) {
          window.location.replace(nextRoute);
          return;
        }

        if (!isCancelled) {
          setState("allowed");
        }
      } catch {
        if (!isCancelled) {
          setState("error");
        }
      }
    }

    void verifyOnboardingAccess();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  if (state === "allowed") {
    return children;
  }

  if (state === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-default p-6 text-center text-text-primary">
        <p className="text-seller-body-md text-text-secondary">
          입점 상태를 확인하지 못했습니다.
        </p>
        <button
          className="text-seller-title font-medium text-text-link"
          onClick={() => window.location.reload()}
          type="button"
        >
          다시 시도하기
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-default p-6 text-center text-text-primary">
      <p aria-live="polite" className="text-sm text-text-secondary">
        입점 상태를 확인하고 있어요.
      </p>
    </main>
  );
}
