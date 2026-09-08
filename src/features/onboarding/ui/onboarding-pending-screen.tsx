"use client";

import { Button } from "@/components/common/button";
import { Header } from "@/components/common/header";

export function OnboardingPendingScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <Header
        backHref="/seller"
        backLabel="로그인 화면으로 돌아가기"
        className="border-none"
        title="입점 신청"
      />
      <section className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <h2 className="text-seller-display-sm font-bold tracking-[-0.66px]">
          입점 신청을 검토하고 있어요
        </h2>
        <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
          보통 하루 안에 결과를 알려드려요.
          <br />
          승인되면 알림으로 알려드릴게요.
        </p>
      </section>
      <div className="flex flex-col items-center gap-[13px] px-4 pt-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
        <Button
          fullWidth
          onClick={() => window.location.replace("/seller")}
          size="lg"
          variant="primary"
        >
          홈으로 가기
        </Button>
        <a
          className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-link"
          href="/seller"
        >
          홈으로 가기
        </a>
      </div>
    </main>
  );
}
