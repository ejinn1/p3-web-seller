"use client";

import { useState } from "react";

import { Button } from "@/components/common/button";
import { Textarea } from "@/components/common/textarea";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import type { Store } from "@/features/store/model/store-types";

type StoreInformationFormProps = {
  descriptionSaveError?: string;
  isDescriptionSaving: boolean;
  onDescriptionSave: (description: string) => Promise<void>;
  onDescriptionSaved: () => void;
  pickupAddress?: string | null;
  refundPeriod?: string | null;
  store?: Store;
  storeQueryIsError: boolean;
  onBusinessHoursClick: () => void;
  onPickupLocationClick: () => void;
  onRefundPeriodClick: () => void;
};

type StoreInformationFieldProps = {
  label: string;
  maxLength: number;
  multiline?: boolean;
  placeholder: string;
  value?: string | null;
  onClick?: () => void;
};

function StoreInformationField({
  label,
  maxLength,
  multiline = false,
  placeholder,
  value,
  onClick,
}: StoreInformationFieldProps) {
  const displayValue = value ?? "";
  const inputContent = (
    <span
      className={displayValue ? "text-text-primary" : "text-text-unavailable"}
    >
      {displayValue || placeholder}
    </span>
  );
  const counter = (
    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
      {displayValue.length}/{maxLength}
    </span>
  );

  const field = onClick ? (
    <button
      className="flex w-full flex-col items-end gap-1 text-left"
      onClick={onClick}
      type="button"
    >
      <span
        className={`flex w-full rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] ${
          multiline ? "h-[88px] items-start py-2" : "h-11 items-center truncate"
        }`}
      >
        <span className={multiline ? "line-clamp-3" : "truncate"}>
          {inputContent}
        </span>
      </span>
      {counter}
    </button>
  ) : (
    <div className="flex w-full flex-col items-end gap-1">
      <span
        className={`flex w-full rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] ${
          multiline ? "h-[88px] items-start py-2" : "h-11 items-center truncate"
        }`}
      >
        <span className={multiline ? "line-clamp-3" : "truncate"}>
          {inputContent}
        </span>
      </span>
      {counter}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1 text-seller-heading-md font-semibold tracking-[-0.54px]">
        {label}
        <span
          aria-hidden="true"
          className="relative -top-1 text-[15px] leading-5 text-text-error"
        >
          *
        </span>
      </p>
      {field}
    </div>
  );
}

function StoreDescriptionField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <label className="flex flex-col gap-2">
      <p className="flex items-center gap-1 text-seller-heading-md font-semibold tracking-[-0.54px]">
        매장 소개
        <span
          aria-hidden="true"
          className="relative -top-1 text-[15px] leading-5 text-text-error"
        >
          *
        </span>
      </p>
      <span className="flex flex-col items-end gap-1">
        <Textarea
          className="h-[88px]"
          maxLength={500}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="매장 소개를 입력해주세요"
          value={value}
        />
        <span
          className={`text-[11px] leading-4 font-medium tracking-[-0.11px] ${
            isFocused ? "text-text-secondary" : "text-text-unavailable"
          }`}
        >
          {value.length}/500
        </span>
      </span>
    </label>
  );
}

export function StoreInformationForm({
  descriptionSaveError,
  isDescriptionSaving,
  onDescriptionSave,
  onDescriptionSaved,
  pickupAddress,
  refundPeriod,
  store,
  storeQueryIsError,
  onBusinessHoursClick,
  onPickupLocationClick,
  onRefundPeriodClick,
}: StoreInformationFormProps) {
  const [description, setDescription] = useState(store?.description ?? "");
  const [savedDescription, setSavedDescription] = useState(
    store?.description ?? "",
  );
  const normalizedDescription = description.trim();
  const canSaveDescription =
    normalizedDescription.length > 0 &&
    normalizedDescription !== savedDescription;

  const saveDescription = async () => {
    if (!canSaveDescription) {
      return;
    }

    try {
      await onDescriptionSave(normalizedDescription);
      setDescription(normalizedDescription);
      setSavedDescription(normalizedDescription);
      onDescriptionSaved();
    } catch {
      // The mutation state is rendered on the current screen.
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader
        backHref="/seller/store-management"
        backLabel="스토어 관리로 돌아가기"
        showMenu={false}
        title="스토어 정보"
      />
      <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-6 pb-4">
        <StoreInformationField
          label="픽업 장소"
          maxLength={100}
          placeholder="픽업 장소를 설정해주세요"
          value={pickupAddress}
          onClick={onPickupLocationClick}
        />
        <StoreInformationField
          label="영업시간"
          maxLength={100}
          placeholder="ex: 월~일 오후 12:00~17:00"
          value={store?.businessHours}
          onClick={onBusinessHoursClick}
        />
        <StoreInformationField
          label="환불기간"
          maxLength={100}
          multiline
          placeholder="환불기간을 설정해주세요"
          value={refundPeriod}
          onClick={onRefundPeriodClick}
        />
        <StoreDescriptionField onChange={setDescription} value={description} />
        {descriptionSaveError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {descriptionSaveError}
          </p>
        ) : null}
        {storeQueryIsError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            스토어 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled={!canSaveDescription || isDescriptionSaving}
          fullWidth
          onClick={() => void saveDescription()}
          size="lg"
        >
          {isDescriptionSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </main>
  );
}
