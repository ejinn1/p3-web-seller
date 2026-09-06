"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PickupLocationHeader } from "./pickup-location-header";

type StoreBusinessHoursScreenProps = {
  onBack: () => void;
};

type TimeFieldProps = {
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;

  return `${period} ${displayHour}시 ${minute}분`;
});

const weekdays = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
];

function TimeField({ label, onChange, value }: TimeFieldProps) {
  return (
    <label className="flex h-11 items-center gap-4">
      <span className="shrink-0 text-seller-heading-md font-semibold tracking-[-0.54px]">
        {label}
      </span>
      <span className="relative flex h-11 flex-1 items-center border-b border-border-default pl-4">
        <select
          className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-12 text-base leading-6 tracking-[-0.32px] outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 size-5 text-text-secondary"
          strokeWidth={1.8}
        />
      </span>
    </label>
  );
}

function Toggle({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={`${label} ${checked ? "사용" : "미사용"}`}
      className={cn(
        "flex h-[26px] w-[43px] items-center rounded-full p-[3px] transition-[background-color] duration-200",
        checked
          ? "justify-end bg-surface-inverse"
          : "justify-start bg-surface-subtle",
      )}
      onClick={onClick}
      role="switch"
      type="button"
    >
      <span className="size-5 rounded-full bg-surface-default transition-none" />
    </button>
  );
}

export function StoreBusinessHoursScreen({
  onBack,
}: StoreBusinessHoursScreenProps) {
  const [businessStart, setBusinessStart] = useState("오전 9시 00분");
  const [businessEnd, setBusinessEnd] = useState("오후 6시 00분");
  const [breakEnabled, setBreakEnabled] = useState(false);
  const [breakStart, setBreakStart] = useState("오후 12시 00분");
  const [breakEnd, setBreakEnd] = useState("오후 1시 00분");
  const [holidayEnabled, setHolidayEnabled] = useState(true);
  const [holidays, setHolidays] = useState<string[]>([]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <PickupLocationHeader onBack={onBack} title="영업시간" />
      <section className="flex flex-1 flex-col gap-6 overflow-y-auto pb-4">
        <section className="flex flex-col gap-4 px-4 pt-6">
          <p className="flex text-seller-heading-md font-semibold tracking-[-0.54px]">
            영업시간
            <span
              aria-hidden="true"
              className="pb-1 text-[15px] text-text-error"
            >
              *
            </span>
          </p>
          <div className="flex flex-col gap-4">
            <TimeField
              label="시작"
              onChange={setBusinessStart}
              value={businessStart}
            />
            <TimeField
              label="종료"
              onChange={setBusinessEnd}
              value={businessEnd}
            />
          </div>
        </section>
        <section className="flex flex-col gap-4 px-4 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-seller-heading-md font-semibold tracking-[-0.54px]">
              휴게시간
            </h2>
            <Toggle
              checked={breakEnabled}
              label="휴게시간"
              onClick={() => setBreakEnabled((enabled) => !enabled)}
            />
          </div>
          {breakEnabled ? (
            <div className="flex flex-col gap-4">
              <TimeField
                label="시작"
                onChange={setBreakStart}
                value={breakStart}
              />
              <TimeField label="종료" onChange={setBreakEnd} value={breakEnd} />
            </div>
          ) : null}
        </section>
        <section className="flex flex-col gap-4 px-4 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-seller-heading-md font-semibold tracking-[-0.54px]">
              휴무일
            </h2>
            <Toggle
              checked={holidayEnabled}
              label="휴무일"
              onClick={() => setHolidayEnabled((enabled) => !enabled)}
            />
          </div>
          {holidayEnabled ? (
            <div className="grid grid-cols-4 gap-2">
              {weekdays.map((weekday) => {
                const selected = holidays.includes(weekday);

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "h-11 rounded-seller-sm px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px]",
                      selected
                        ? "bg-surface-inverse text-text-inverse"
                        : "bg-surface-subtle text-text-secondary",
                    )}
                    key={weekday}
                    onClick={() =>
                      setHolidays((currentHolidays) =>
                        selected
                          ? currentHolidays.filter((day) => day !== weekday)
                          : [...currentHolidays, weekday],
                      )
                    }
                    type="button"
                  >
                    {weekday}
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled
          fullWidth
          size="lg"
        >
          다음
        </Button>
      </div>
    </main>
  );
}
