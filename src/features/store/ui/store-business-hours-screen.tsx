"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/button";
import { useUpdateStoreBusinessHoursMutation } from "@/features/store/model/store-mutations";
import { useStoreBusinessHoursQuery } from "@/features/store/model/store-queries";
import type {
  DayOfWeek,
  StoreBusinessHours,
  StoreBusinessHoursInput,
} from "@/features/store/model/store-types";
import { cn } from "@/lib/utils";

import { PickupLocationHeader } from "./pickup-location-header";

type StoreBusinessHoursScreenProps = {
  onBack: () => void;
};

type TimeFieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string | null;
};

type StoreBusinessHoursFormProps = {
  businessHours?: StoreBusinessHours;
  isLoadError: boolean;
  isSaveError: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: (input: StoreBusinessHoursInput) => Promise<void>;
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;

  return {
    label: `${period} ${displayHour}시 ${minute}분`,
    value: `${String(hour).padStart(2, "0")}:${minute}`,
  };
});

const weekdays: { label: string; value: DayOfWeek }[] = [
  { label: "월요일", value: "MONDAY" },
  { label: "화요일", value: "TUESDAY" },
  { label: "수요일", value: "WEDNESDAY" },
  { label: "목요일", value: "THURSDAY" },
  { label: "금요일", value: "FRIDAY" },
  { label: "토요일", value: "SATURDAY" },
  { label: "일요일", value: "SUNDAY" },
];

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

function TimeField({ label, onChange, placeholder, value }: TimeFieldProps) {
  return (
    <label className="flex h-11 items-center gap-4">
      <span className="shrink-0 text-seller-heading-md font-semibold tracking-[-0.54px]">
        {label}
      </span>
      <span className="relative flex h-11 flex-1 items-center border-b border-border-default pl-4">
        <select
          className={cn(
            "h-full min-w-0 flex-1 appearance-none bg-transparent pr-12 text-base leading-6 tracking-[-0.32px] outline-none",
            value ? "text-text-primary" : "text-text-unavailable",
          )}
          onChange={(event) => onChange(event.target.value)}
          value={value ?? ""}
        >
          <option disabled hidden value="">
            {placeholder}
          </option>
          {timeOptions.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
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

function StoreBusinessHoursForm({
  businessHours,
  isLoadError,
  isSaveError,
  isSaving,
  onBack,
  onSave,
}: StoreBusinessHoursFormProps) {
  const hasSavedBusinessHours = Boolean(
    businessHours?.startTime && businessHours.endTime,
  );
  const [businessStart, setBusinessStart] = useState(
    businessHours?.startTime ? normalizeTime(businessHours.startTime) : null,
  );
  const [businessEnd, setBusinessEnd] = useState(
    businessHours?.endTime ? normalizeTime(businessHours.endTime) : null,
  );
  const [breakEnabled, setBreakEnabled] = useState(
    Boolean(businessHours?.breakStartTime && businessHours.breakEndTime),
  );
  const [breakStart, setBreakStart] = useState(
    businessHours?.breakStartTime
      ? normalizeTime(businessHours.breakStartTime)
      : null,
  );
  const [breakEnd, setBreakEnd] = useState(
    businessHours?.breakEndTime ? normalizeTime(businessHours.breakEndTime) : null,
  );
  const [holidays, setHolidays] = useState<DayOfWeek[]>(() =>
    hasSavedBusinessHours
      ? weekdays
          .map((weekday) => weekday.value)
          .filter((day) => !businessHours?.openDays.includes(day))
      : [],
  );
  const [holidayEnabled, setHolidayEnabled] = useState(
    hasSavedBusinessHours && holidays.length > 0,
  );

  const openDays = holidayEnabled
    ? weekdays
        .map((weekday) => weekday.value)
        .filter((weekday) => !holidays.includes(weekday))
    : weekdays.map((weekday) => weekday.value);
  const hasValidBreakTime =
    !breakEnabled ||
    (businessStart !== null &&
      businessEnd !== null &&
      breakStart !== null &&
      breakEnd !== null &&
      businessStart <= breakStart &&
      breakStart < breakEnd &&
      breakEnd <= businessEnd);
  const canSave =
    !isLoadError &&
    businessStart !== null &&
    businessEnd !== null &&
    businessStart < businessEnd &&
    hasValidBreakTime &&
    openDays.length > 0;

  const handleSave = async () => {
    if (
      !businessStart ||
      !businessEnd ||
      (breakEnabled && (!breakStart || !breakEnd))
    ) {
      return;
    }

    try {
      await onSave({
        openDays,
        startTime: businessStart,
        endTime: businessEnd,
        breakStartTime: breakEnabled ? breakStart : null,
        breakEndTime: breakEnabled ? breakEnd : null,
      });
      onBack();
    } catch {
      // The mutation state is rendered on the current screen.
    }
  };

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
              placeholder="오전 9시 00분"
              value={businessStart}
            />
            <TimeField
              label="종료"
              onChange={setBusinessEnd}
              placeholder="오후 6시 00분"
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
                placeholder="오후 12시 00분"
                value={breakStart}
              />
              <TimeField
                label="종료"
                onChange={setBreakEnd}
                placeholder="오후 1시 00분"
                value={breakEnd}
              />
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
                const selected = holidays.includes(weekday.value);

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "h-11 rounded-seller-sm px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px]",
                      selected
                        ? "bg-surface-inverse text-text-inverse"
                        : "bg-surface-subtle text-text-secondary",
                    )}
                    key={weekday.value}
                    onClick={() =>
                      setHolidays((currentHolidays) =>
                        selected
                          ? currentHolidays.filter(
                              (day) => day !== weekday.value,
                            )
                          : [...currentHolidays, weekday.value],
                      )
                    }
                    type="button"
                  >
                    {weekday.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>
        {isLoadError ? (
          <p aria-live="polite" className="px-4 text-sm text-text-error">
            영업시간을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {isSaveError ? (
          <p aria-live="polite" className="px-4 text-sm text-text-error">
            영업시간을 저장하지 못했습니다. 입력값을 확인해 주세요.
          </p>
        ) : null}
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled={!canSave || isSaving}
          fullWidth
          onClick={() => void handleSave()}
          size="lg"
        >
          {isSaving ? "저장 중..." : "다음"}
        </Button>
      </div>
    </main>
  );
}

export function StoreBusinessHoursScreen({
  onBack,
}: StoreBusinessHoursScreenProps) {
  const businessHoursQuery = useStoreBusinessHoursQuery();
  const updateBusinessHoursMutation = useUpdateStoreBusinessHoursMutation();

  if (businessHoursQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
        <PickupLocationHeader onBack={onBack} title="영업시간" />
        <p className="px-4 pt-6 text-sm text-text-secondary">
          영업시간을 불러오고 있습니다.
        </p>
      </main>
    );
  }

  const businessHoursKey = businessHoursQuery.data
    ? JSON.stringify(businessHoursQuery.data)
    : "new";

  return (
    <StoreBusinessHoursForm
      businessHours={businessHoursQuery.data}
      isLoadError={businessHoursQuery.isError}
      isSaveError={updateBusinessHoursMutation.isError}
      isSaving={updateBusinessHoursMutation.isPending}
      key={businessHoursKey}
      onBack={onBack}
      onSave={async (input) => {
        await updateBusinessHoursMutation.mutateAsync(input);
      }}
    />
  );
}
