"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type InlineSelectOption = {
  label: string;
  value: string;
};

type InlineSelectProps = {
  ariaLabel: string;
  className?: string;
  onValueChange: (value: string) => void;
  options: InlineSelectOption[];
  placeholder: string;
  value: string | null;
  valueClassName?: string;
};

const OPTION_HEIGHT = 44;
const VISIBLE_OPTION_COUNT = 5;

export function InlineSelect({
  ariaLabel,
  className,
  onValueChange,
  options,
  placeholder,
  value,
  valueClassName,
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const availableOptions = options.filter((option) => option.value !== value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return;
    }

    const anchorIndex = options.findIndex(
      (option) => option.value === value || option.label === placeholder,
    );

    listRef.current.scrollTop = Math.max(anchorIndex, 0) * OPTION_HEIGHT;
  }, [isOpen, options, placeholder, value]);

  return (
    <div className={cn("relative min-w-0", className)} ref={containerRef}>
      <button
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="relative flex h-11 w-full items-center border-b border-border-default px-2 pr-9 text-left outline-none focus-visible:border-border-focus"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span
          className={cn(
            "truncate text-base leading-6 tracking-[-0.32px]",
            selectedOption ? "text-text-primary" : "text-text-unavailable",
            valueClassName,
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-2 size-5 text-icon-default transition-transform",
            isOpen && "rotate-180",
          )}
          strokeWidth={1.8}
        />
      </button>
      {isOpen ? (
        <div
          className="absolute top-full right-0 left-0 z-20 overflow-y-auto overscroll-contain rounded-b-seller-sm bg-surface-default py-1 shadow-lg"
          id={listId}
          ref={listRef}
          role="listbox"
          style={{ maxHeight: OPTION_HEIGHT * VISIBLE_OPTION_COUNT }}
        >
          {availableOptions.map((option) => (
            <button
              aria-selected="false"
              className="flex h-11 w-full shrink-0 items-center rounded-seller-sm px-2 text-left text-base leading-6 tracking-[-0.32px] text-text-primary outline-none hover:bg-surface-hover focus-visible:bg-surface-hover"
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
