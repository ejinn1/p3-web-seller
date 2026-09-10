"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";
import { Header } from "@/components/common/header";
import type { OnboardingLocation } from "@/features/onboarding/model/types";

type OnboardingLocationDetailScreenProps = {
  initialDetailAddress: string;
  location: OnboardingLocation;
  onBack: () => void;
  onConfirm: (detailAddress: string) => void;
};

export function OnboardingLocationDetailScreen({
  initialDetailAddress,
  location,
  onBack,
  onConfirm,
}: OnboardingLocationDetailScreenProps) {
  const [detailAddress, setDetailAddress] = useState(initialDetailAddress);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backLabel="주소 검색으로 돌아가기"
        className="border-none"
        onBack={onBack}
        title="스토어 위치"
      />
      <section className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1 text-seller-heading-md font-semibold tracking-[-0.54px]">
            스토어 위치
            <span
              aria-hidden="true"
              className="relative -top-1 text-[15px] leading-5 text-text-error"
            >
              *
            </span>
          </p>
          <p className="flex min-h-11 items-center rounded-seller-sm bg-surface-subtle px-4 py-2 text-base leading-6 tracking-[-0.32px]">
            {location.address}
          </p>
        </div>
        <label className="flex flex-col gap-2" htmlFor="store-detail-address">
          <span className="text-seller-heading-md font-semibold tracking-[-0.54px]">
            상세주소
          </span>
          <span className="flex flex-col items-end gap-1">
            <input
              autoFocus
              className="h-11 w-full rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable focus:ring-2 focus:ring-brand-primary/20"
              id="store-detail-address"
              maxLength={100}
              onChange={(event) => setDetailAddress(event.target.value)}
              placeholder="ex: 104호"
              value={detailAddress}
            />
            <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
              {detailAddress.length}/100
            </span>
          </span>
        </label>
      </section>
      <div className="px-4 pt-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          fullWidth
          onClick={() => onConfirm(detailAddress.trim())}
          size="lg"
        >
          확인
        </Button>
      </div>
    </main>
  );
}
