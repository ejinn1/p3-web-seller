"use client";

import { useEffect, useState } from "react";
import { syncCurrentUser } from "@/features/auth/api/auth-api";
import {
  CognitoError,
  completeCognitoSignIn,
} from "@/features/auth/model/cognito";
import { getCurrentOnboarding } from "@/features/onboarding/api/onboarding-api";
import { getStoreManagementStatus } from "@/features/store/api/store-api";
import { ApiError } from "@/lib/api/types";

type CallbackState = "loading" | "complete" | "error";

export function CognitoCallback() {
  const [message, setMessage] = useState("로그인 정보를 확인하고 있어요.");
  const [state, setState] = useState<CallbackState>("loading");

  useEffect(() => {
    async function complete() {
      try {
        await completeCognitoSignIn(
          new URLSearchParams(window.location.search),
        );
        const user = await syncCurrentUser();

        if (user.nextRoute === "ROLE_SELECTION") {
          window.location.replace("/auth/role");
          return;
        }

        if (!user.registered || user.role !== "SELLER") {
          setMessage("판매자 가입 상태를 확인해 주세요.");
          setState("complete");
          return;
        }

        const onboarding = await getCurrentOnboarding().catch(
          (error: unknown) => {
            if (
              error instanceof ApiError &&
              [401, 404].includes(error.status)
            ) {
              window.location.replace("/auth/role");
              return null;
            }

            throw error;
          },
        );

        if (!onboarding) {
          return;
        }

        if (onboarding.status === "PENDING") {
          window.location.replace("/onboarding/pending");
          return;
        }

        if (onboarding.status === "REJECTED") {
          window.location.replace("/onboarding/rejected");
          return;
        }

        if (onboarding.status === "APPROVED") {
          const managementStatus = await getStoreManagementStatus().catch(
            () => null,
          );
          const isStoreSetupComplete =
            managementStatus !== null &&
            Object.values(managementStatus.items).every(Boolean);

          window.location.replace(
            isStoreSetupComplete ? "/seller/home" : "/seller/store-management",
          );
          return;
        }

        const sellerHomePath = process.env.NEXT_PUBLIC_SELLER_HOME_PATH;

        if (sellerHomePath) {
          window.location.replace(sellerHomePath);
          return;
        }

        setMessage("로그인이 완료되었습니다. 판매자 홈 화면을 준비 중입니다.");
        setState("complete");
      } catch (callbackError) {
        setMessage(
          callbackError instanceof CognitoError
            ? callbackError.message
            : "로그인을 완료하지 못했습니다. 다시 시도해 주세요.",
        );
        setState("error");
      }
    }

    void complete();
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-default p-6 text-center text-text-primary">
      <div className="space-y-3">
        <p className="text-lg font-bold">
          {state === "loading" ? "로그인 중" : "로그인"}
        </p>
        <p aria-live="polite" className="text-sm text-seller-muted">
          {message}
        </p>
        {state === "error" ? (
          <a
            className="inline-block text-sm font-medium underline"
            href="/seller"
          >
            로그인 화면으로 돌아가기
          </a>
        ) : null}
      </div>
    </main>
  );
}
