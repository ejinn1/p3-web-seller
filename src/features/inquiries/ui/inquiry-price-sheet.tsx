import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { parsePriceInput } from "@/features/inquiries/model/inquiry-order-confirmation";
import type { InquiryOrderOption } from "@/features/inquiries/model/inquiry-types";
import { cn } from "@/lib/utils";

export function InquiryPriceSheet({
  onClose,
  onConfirm,
  options,
  prices,
}: {
  onClose: () => void;
  onConfirm: (prices: Record<string, number>) => void;
  options: InquiryOrderOption[];
  prices: Record<string, number>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      options.map((option) => [
        option.id,
        prices[option.id] === undefined
          ? ""
          : prices[option.id].toLocaleString("ko-KR"),
      ]),
    ),
  );
  const isComplete = options.every((option) => {
    const amount = parsePriceInput(drafts[option.id]);
    return amount !== null && amount >= 0;
  });

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-scrim" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-seller-lg bg-surface-default px-4 pt-8 pb-4 outline-none">
          <div className="flex h-12 items-start justify-between">
            <Dialog.Title className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
              추가 금액
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="닫기"
                className="flex size-10 items-center justify-center text-text-secondary"
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="space-y-6">
            {options.map((option) => (
              <PriceInput
                isFilled={parsePriceInput(drafts[option.id]) !== null}
                key={option.id}
                label={option.label}
                onValueChange={(value) =>
                  setDrafts((current) => ({ ...current, [option.id]: value }))
                }
                value={drafts[option.id] ?? ""}
              />
            ))}
            <div className="h-px bg-surface-subtle opacity-90" />
          </div>
          <button
            className={cn(
              "h-[52px] rounded-seller-md text-[18px] leading-6 font-semibold tracking-[-0.54px]",
              isComplete
                ? "bg-brand-primary text-text-inverse"
                : "bg-brand-disabled text-text-disabled",
            )}
            disabled={!isComplete}
            onClick={() =>
              onConfirm(
                Object.fromEntries(
                  options.map((option) => [
                    option.id,
                    parsePriceInput(drafts[option.id]) ?? 0,
                  ]),
                ),
              )
            }
            type="button"
          >
            확인
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PriceInput({
  isFilled,
  label,
  onValueChange,
  value,
}: {
  isFilled: boolean;
  label: string;
  onValueChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
        <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
          *
        </span>
      </span>
      <span className="flex h-11 items-start gap-2">
        <input
          className={cn(
            "h-11 min-w-0 flex-1 border-b border-border-default py-1 outline-none",
            isFilled
              ? "text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary"
              : "text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-disabled",
          )}
          inputMode="numeric"
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="금액 입력"
          value={value}
        />
        <span className="flex h-11 w-4 items-center text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          원
        </span>
      </span>
    </label>
  );
}
