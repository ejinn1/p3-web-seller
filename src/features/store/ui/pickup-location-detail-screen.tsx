"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";
import { SellerMenuHeader } from "@/components/widgets/seller-menu-header";

type PickupLocationDetailScreenProps = {
  address: string;
  onBack: () => void;
  onConfirm: (pickupAddress: string) => Promise<void>;
  onSearch: () => void;
  saveError?: string;
  isSaving: boolean;
};

export function PickupLocationDetailScreen({
  address,
  onBack,
  onConfirm,
  onSearch,
  saveError,
  isSaving,
}: PickupLocationDetailScreenProps) {
  const [detailAddress, setDetailAddress] = useState("");
  const pickupAddress = `${address} ${detailAddress.trim()}`.trim();
  const canConfirm = Boolean(address.trim() && pickupAddress.length <= 255);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <SellerMenuHeader
        backLabel="이전 화면으로 돌아가기"
        className="border-none"
        onBack={onBack}
        title="픽업 장소"
      />
      <section className="flex flex-1 flex-col gap-6 px-4 pt-6">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1 text-seller-heading-md font-semibold tracking-[-0.54px]">
            픽업 장소
            <span
              aria-hidden="true"
              className="relative -top-1 text-[15px] leading-5 text-text-error"
            >
              *
            </span>
          </p>
          <button
            className="h-11 w-full truncate rounded-seller-sm bg-surface-subtle px-4 text-left text-base leading-6 tracking-[-0.32px] text-text-primary"
            onClick={onSearch}
            type="button"
          >
            {address || "픽업 장소를 검색해주세요"}
          </button>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-seller-heading-md font-semibold tracking-[-0.54px]">
            상세주소
          </span>
          <span className="flex flex-col items-end gap-1">
            <input
              className="h-11 w-full rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable"
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
        {pickupAddress.length > 255 ? (
          <p aria-live="polite" className="text-sm text-text-error">
            픽업 장소는 255자 이내로 입력해 주세요.
          </p>
        ) : null}
        {saveError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {saveError}
          </p>
        ) : null}
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled={!canConfirm || isSaving}
          fullWidth
          onClick={() => void onConfirm(pickupAddress)}
          size="lg"
        >
          {isSaving ? "저장 중..." : "확인"}
        </Button>
      </div>
    </main>
  );
}
