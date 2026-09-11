"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { cn } from "@/lib/utils";

export type RevenueDateRange = {
  endDate: string;
  startDate: string;
};

export type RevenueDateRangeDraft = {
  endDate: string | null;
  startDate: string | null;
};

export type RevenueDateRangeStep = "start" | "end" | "done";

type RevenueDateRangeSheetProps = {
  calendarMonth: Date;
  dateRange: RevenueDateRangeDraft;
  onBack: () => void;
  onClose: () => void;
  onMoveMonth: (amount: number) => void;
  onNext: () => void;
  onSelectDate: (date: string) => void;
  open: boolean;
  step: RevenueDateRangeStep;
};

export function RevenueDateRangeSheet({
  calendarMonth,
  dateRange,
  onBack,
  onClose,
  onMoveMonth,
  onNext,
  onSelectDate,
  open,
  step,
}: RevenueDateRangeSheetProps) {
  const title = step === "start" ? "시작일" : "종료일";
  const nextLabel = step === "done" ? "확인" : "다음";
  const selectedDate =
    step === "start" ? dateRange.startDate : dateRange.endDate;
  const nextDisabled = !selectedDate;

  return (
    <BottomSheet
      className="bg-surface-elevated shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      open={open}
    >
      <div
        className="flex w-full flex-col gap-4"
        data-qa="revenue-custom-date-sheet"
      >
        <SheetTitle onClose={onClose}>{title}</SheetTitle>
        <div className="flex flex-col gap-4">
          <div className="flex h-6 items-center justify-center gap-4 overflow-hidden">
            <button
              aria-label="이전 달"
              className="flex size-6 items-center justify-center text-icon-default"
              onClick={() => onMoveMonth(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-6" />
            </button>
            <p className="text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-primary">
              {formatMonthLabel(calendarMonth)}
            </p>
            <button
              aria-label="다음 달"
              className="flex size-6 items-center justify-center text-icon-default"
              onClick={() => onMoveMonth(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-6" />
            </button>
          </div>
          <CalendarGrid
            minDate={step === "start" ? null : dateRange.startDate}
            month={calendarMonth}
            onSelect={onSelectDate}
            selectedDate={selectedDate}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-seller-md border border-border-default bg-surface-default px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            data-qa="revenue-custom-date-back"
            onClick={onBack}
            type="button"
          >
            뒤로가기
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-seller-md bg-brand-primary px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled"
            data-qa="revenue-custom-date-next"
            disabled={nextDisabled}
            onClick={onNext}
            type="button"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function SheetTitle({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex h-7 w-full items-start justify-between">
      <h2 className="text-seller-heading-lg leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {children}
      </h2>
      <button
        aria-label="닫기"
        className="flex size-10 items-center justify-end text-icon-default"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}

function CalendarGrid({
  minDate,
  month,
  onSelect,
  selectedDate,
}: {
  minDate: string | null;
  month: Date;
  onSelect: (date: string) => void;
  selectedDate: string | null;
}) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
    ...Array.from({ length: 42 - firstDay - dayCount }, () => null),
  ];

  return (
    <div className="flex flex-col gap-1" data-qa="revenue-calendar">
      <div className="grid h-6 grid-cols-7">
        {days.map((day, index) => (
          <span
            className={cn(
              "flex items-center justify-center text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary",
              index === 0 && "text-text-error",
            )}
            key={day}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const isSunday = index % 7 === 0;
          const date = day ? toIsoDate(new Date(year, monthIndex, day)) : null;
          const isSelected = date !== null && selectedDate === date;
          const isDisabled =
            date !== null && minDate !== null && date < minDate;

          return (
            <button
              aria-label={date ? `${date} 선택` : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-seller-sm text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-primary",
                isSunday && "text-text-error",
                isSelected && "bg-brand-primary text-text-inverse",
                isDisabled && "text-text-unavailable",
              )}
              disabled={!date || isDisabled}
              key={`${day ?? "empty"}-${index}`}
              onClick={date ? () => onSelect(date) : undefined}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function moveMonth(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthLabel(value: Date) {
  return `${value.getFullYear()}년 ${value.getMonth() + 1}월`;
}
