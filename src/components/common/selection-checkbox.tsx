"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectionCheckboxProps = {
  ariaLabel: string;
  checked: boolean;
  className?: string;
  onChange: () => void;
};

export function SelectionCheckbox({
  ariaLabel,
  checked,
  className,
  onChange,
}: SelectionCheckboxProps) {
  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-seller-primary focus-visible:ring-offset-2",
        className,
      )}
      onClick={onChange}
      type="button"
    >
      <span
        className={cn(
          "flex size-[18px] items-center justify-center rounded-[6px] border transition-colors",
          checked
            ? "border-icon-default bg-icon-default text-text-inverse"
            : "border-border-default bg-brand-disabled text-transparent",
        )}
      >
        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
      </span>
    </button>
  );
}
