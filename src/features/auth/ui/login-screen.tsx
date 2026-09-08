"use client";

import {
  CognitoError,
  startCognitoSignIn,
} from "@/features/auth/model/cognito";
import Image from "next/image";
import { useState } from "react";

export function LoginScreen() {
  const [error, setError] = useState<string>();
  const [pendingProvider, setPendingProvider] = useState<"kakao" | "google">();

  async function handleSignIn(provider: "kakao" | "google") {
    setError(undefined);
    setPendingProvider(provider);

    try {
      await startCognitoSignIn(provider);
    } catch (signInError) {
      setPendingProvider(undefined);
      setError(
        signInError instanceof CognitoError
          ? signInError.message
          : "로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }

  return (
    <main className="flex min-h-dvh bg-surface-default px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-6 text-text-primary">
      <div className="mx-auto flex w-full max-w-[768px] flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center gap-8 pt-12">
          <Image
            alt="wihada"
            height={35}
            priority
            src="/brand/wihada-logo.svg"
            width={153}
          />
          <div className="w-full text-center">
            <h1 className="text-[22px] leading-[30px] font-bold tracking-[-0.66px]">
              주문제작 케이크,
              <br />
              사장님과 바로 이야기하세요
            </h1>
            <p className="mt-2 text-base leading-6 tracking-[-0.32px] text-text-secondary">
              3초면 시작할 수 있어요.
            </p>
          </div>
        </section>

        <section aria-label="소셜 로그인" className="space-y-2">
          <button
            className="relative flex h-[52px] w-full items-center justify-center rounded-xl bg-[#ffe600] px-[18px] text-base font-medium tracking-[-0.16px] text-text-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60"
            disabled={Boolean(pendingProvider)}
            onClick={() => handleSignIn("kakao")}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="absolute left-[18px]"
              height={20}
              src="/brand/kakao.svg"
              width={22}
            />
            {pendingProvider === "kakao" ? "로그인 중..." : "카카오 로그인"}
          </button>
          <button
            className="relative flex h-[52px] w-full items-center justify-center rounded-xl border border-border-default bg-surface-default px-4 text-base font-medium tracking-[-0.16px] text-text-primary transition-colors hover:bg-seller-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-wait disabled:opacity-60"
            disabled={Boolean(pendingProvider)}
            onClick={() => handleSignIn("google")}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="absolute left-[18px]"
              height={20}
              src="/brand/google-logo.svg"
              width={20}
            />
            {pendingProvider === "google" ? "로그인 중..." : "Google 로그인"}
          </button>
          {error ? (
            <p
              aria-live="polite"
              className="pt-1 text-center text-sm text-seller-danger"
            >
              {error}
            </p>
          ) : null}
        </section>
        <p className="mt-4 text-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-disabled">
          이용약관과 개인정보 처리방침 확인
        </p>
      </div>
    </main>
  );
}
