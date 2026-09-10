"use client";

import { useEffect, useState } from "react";
import { syncCurrentUser } from "@/features/auth/api/auth-api";
import {
  CognitoError,
  completeCognitoSignIn,
} from "@/features/auth/model/cognito";
import { resolveAuthenticatedEntryRoute } from "@/features/auth/model/authenticated-entry-route";

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
        const nextRoute = await resolveAuthenticatedEntryRoute(user);
        window.location.replace(nextRoute);
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
