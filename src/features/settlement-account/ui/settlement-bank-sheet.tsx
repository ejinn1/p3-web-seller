"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/common/bottom-sheet";
import type { SettlementBank } from "@/features/settlement-account/model/settlement-account-types";
import { cn } from "@/lib/utils";

type SettlementBankSheetProps = {
  banks: SettlementBank[];
  onConfirm: (bankCode: string) => void;
  onOpenChange: (open: boolean) => void;
  selectedBankCode: string;
};

export function SettlementBankSheet({
  banks,
  onConfirm,
  onOpenChange,
  selectedBankCode,
}: SettlementBankSheetProps) {
  const [draftBankCode, setDraftBankCode] = useState(selectedBankCode);

  return (
    <BottomSheet
      className="max-h-[80dvh] gap-5"
      onOpenChange={onOpenChange}
      open
    >
      <div className="flex h-7 items-center justify-between">
        <h2 className="text-seller-heading-lg leading-7 font-bold tracking-[-0.6px] text-text-primary">
          은행을 선택해 주세요
        </h2>
        <button
          aria-label="은행 선택 닫기"
          className="flex size-10 items-center justify-center text-icon-default"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X aria-hidden="true" className="size-6" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {banks.map((bank) => {
          const selected = draftBankCode === bank.code;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex h-12 w-full items-center justify-between border-b border-border-default px-1 text-left text-base leading-6 tracking-[-0.32px] text-text-primary",
                selected && "font-semibold",
              )}
              key={bank.code}
              onClick={() => setDraftBankCode(bank.code)}
              type="button"
            >
              {bank.name}
              {selected ? (
                <Check
                  aria-hidden="true"
                  className="size-5 text-brand-primary"
                  strokeWidth={2.5}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-seller-md bg-brand-primary px-6 text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled"
        disabled={!draftBankCode}
        onClick={() => {
          onConfirm(draftBankCode);
          onOpenChange(false);
        }}
        type="button"
      >
        다음
      </button>
    </BottomSheet>
  );
}
