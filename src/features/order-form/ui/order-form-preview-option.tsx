"use client";

import Image from "next/image";
import { useState } from "react";
import { Radio } from "@/components/common/radio";
import type { OrderFormDraftOption } from "@/features/order-form/model/order-form-draft";

type OrderFormPreviewOptionProps = {
  groupName: string;
  option: OrderFormDraftOption;
};

function formatPrice(price: string) {
  const trimmedPrice = price.trim();
  const normalizedPrice = trimmedPrice.replace(/,/g, "");

  if (!/^\d+$/.test(normalizedPrice)) {
    return trimmedPrice;
  }

  return `+ ${Number(normalizedPrice).toLocaleString("ko-KR")}원`;
}

function OptionHeader({ groupName, option }: OrderFormPreviewOptionProps) {
  return (
    <label className="flex min-h-6 w-full cursor-pointer items-start justify-between gap-3">
      <span className="flex min-w-0 items-start">
        <Radio className="-my-1" name={groupName} />
        <p className="min-w-0 text-base leading-6 tracking-[-0.32px]">
          {option.label}
        </p>
      </span>
      <p className="shrink-0 text-right text-[15px] leading-[22px] font-semibold tracking-[-0.15px]">
        {formatPrice(option.price)}
      </p>
    </label>
  );
}

function Description({ value }: { value: string }) {
  return value ? (
    <p className="w-full text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
      * {value}
    </p>
  ) : null;
}

type PreviewTextFieldProps = {
  label: string;
  maxLength: number;
  multiline?: boolean;
  placeholder: string;
};

function PreviewTextField({
  label,
  maxLength,
  multiline = false,
  placeholder,
}: PreviewTextFieldProps) {
  const [length, setLength] = useState(0);
  const fieldClassName =
    "w-full rounded-seller-sm bg-surface-subtle px-4 py-2 text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable";

  return (
    <div className="flex flex-col items-end gap-1">
      {multiline ? (
        <textarea
          aria-label={label}
          className={`${fieldClassName} min-h-[88px] resize-none`}
          maxLength={maxLength}
          onChange={(event) => setLength(event.currentTarget.value.length)}
          placeholder={placeholder}
        />
      ) : (
        <input
          aria-label={label}
          className={`${fieldClassName} h-11`}
          maxLength={maxLength}
          onChange={(event) => setLength(event.currentTarget.value.length)}
          placeholder={placeholder}
          type="text"
        />
      )}
      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
        {length}/{maxLength}
      </span>
    </div>
  );
}

export function OrderFormPreviewOption({
  groupName,
  option,
}: OrderFormPreviewOptionProps) {
  if (option.type === "TEXTAREA") {
    return (
      <div className="flex flex-col gap-2">
        <PreviewTextField
          label={option.label}
          maxLength={500}
          multiline
          placeholder={option.example || "요청사항을 입력해주세요"}
        />
        <Description value={option.description} />
      </div>
    );
  }

  if (option.type === "IMAGE") {
    return (
      <div className="flex flex-col gap-2">
        <OptionHeader groupName={groupName} option={option} />
        <div
          aria-label="사진 첨부 영역"
          className="flex size-[100px] items-center justify-center rounded-seller-sm bg-surface-subtle"
          role="img"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={48}
            src="/order-form/upload.svg"
            width={48}
          />
        </div>
        <Description value={option.description} />
      </div>
    );
  }

  if (option.type === "SELECT_WITH_TEXT") {
    return (
      <div className="flex flex-col gap-2">
        <OptionHeader groupName={groupName} option={option} />
        <PreviewTextField
          label={`${option.label} 상세 입력`}
          maxLength={100}
          placeholder={option.example || "설명예시를 입력해주세요"}
        />
        <Description value={option.description} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <OptionHeader groupName={groupName} option={option} />
      <Description value={option.description} />
    </div>
  );
}
