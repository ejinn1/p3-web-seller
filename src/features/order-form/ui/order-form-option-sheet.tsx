"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import type {
  OrderFormDraftOption,
  OrderFormDraftPriceMode,
  OrderFormDraftOptionType,
} from "@/features/order-form/model/order-form-draft";
import { cn } from "@/lib/utils";

type OrderFormOptionSheetProps = {
  initialOption?: OrderFormDraftOption;
  onComplete: (option: OrderFormDraftOption) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const optionTypes: { label: string; type: OrderFormDraftOptionType }[] = [
  { label: "기본", type: "SELECT" },
  { label: "추가설명", type: "SELECT_WITH_TEXT" },
  { label: "사진첨부", type: "IMAGE" },
  { label: "기타설명", type: "TEXTAREA" },
];

function PriceToggle({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={`직접 가격 입력 ${checked ? "사용" : "미사용"}`}
      className={cn(
        "flex h-[26px] w-[43px] items-center rounded-full p-[3px]",
        checked
          ? "justify-end bg-surface-inverse"
          : "justify-start bg-brand-disabled",
      )}
      onClick={onClick}
      role="switch"
      type="button"
    >
      <span className="size-5 rounded-full bg-surface-default" />
    </button>
  );
}

function formatNumericPrice(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}

export function OrderFormOptionSheet({
  initialOption,
  onComplete,
  onOpenChange,
  open,
}: OrderFormOptionSheetProps) {
  const [label, setLabel] = useState(initialOption?.label ?? "");
  const [price, setPrice] = useState(initialOption?.price ?? "");
  const [priceMode, setPriceMode] = useState<OrderFormDraftPriceMode>(
    initialOption?.priceMode ?? "FIXED",
  );
  const [description, setDescription] = useState(
    initialOption?.description ?? "",
  );
  const [example, setExample] = useState(initialOption?.example ?? "");
  const [type, setType] = useState<OrderFormDraftOptionType>(
    initialOption?.type ?? "SELECT",
  );
  const normalizedPrice = Number(price.replace(/,/g, ""));
  const hasValidFixedPrice =
    /^\d+$/.test(price.replace(/,/g, "")) &&
    Number.isSafeInteger(normalizedPrice) &&
    normalizedPrice >= 0;
  const isCompleteDisabled =
    type === "TEXTAREA"
      ? !example.trim()
      : !label.trim() ||
        (type === "IMAGE"
          ? priceMode === "FIXED" && !hasValidFixedPrice
          : !price.trim());

  const completeOption = () => {
    if (isCompleteDisabled) {
      return;
    }

    onComplete({
      description: description.trim(),
      example: example.trim(),
      id: initialOption?.id ?? crypto.randomUUID(),
      label: label.trim(),
      price: type === "IMAGE" && priceMode === "INQUIRY" ? "" : price,
      priceMode,
      type,
    });
    onOpenChange(false);
  };

  return (
    <BottomSheet onOpenChange={onOpenChange} open={open}>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-seller-heading-lg font-bold tracking-[-0.6px]">
              유형 선택
            </h2>
            <button
              aria-label="옵션 유형 선택 닫기"
              className="-mr-2 flex size-12 items-center justify-center"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-6" strokeWidth={2} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {optionTypes.map((optionType) => (
              <button
                className={cn(
                  "h-11 shrink-0 rounded-seller-sm px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px]",
                  type === optionType.type
                    ? "bg-surface-inverse text-text-inverse"
                    : "bg-surface-subtle text-text-secondary",
                )}
                key={optionType.type}
                onClick={() => {
                  if (optionType.type === type) return;
                  setType(optionType.type);
                  if (optionType.type === "IMAGE") {
                    setPrice("");
                    setPriceMode("INQUIRY");
                  } else {
                    setPriceMode("FIXED");
                  }
                }}
                type="button"
              >
                {optionType.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {type === "SELECT_WITH_TEXT" ? (
              <>
                <div className="flex items-start gap-4">
                  <label className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="flex items-center gap-1 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                      옵션명
                      <span className="relative -top-1 text-[15px] leading-4 font-semibold text-text-error">
                        *
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <Input
                        className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                        maxLength={100}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="옵션 1"
                        value={label}
                      />
                      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                        {label.length}/100
                      </span>
                    </span>
                  </label>
                  <label className="flex w-[100px] shrink-0 flex-col gap-2">
                    <span className="flex items-center gap-1 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                      가격
                      <span className="relative -top-1 text-[15px] leading-4 font-semibold text-text-error">
                        *
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <Input
                        className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                        inputMode="numeric"
                        maxLength={100}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="1,000"
                        value={price}
                      />
                      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                        {price.length}/100
                      </span>
                    </span>
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    서브 설명
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="기본체 or 필기체 작성해서 보내주세요"
                      value={description}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {description.length}/100
                    </span>
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    설명예시
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setExample(event.target.value)}
                      placeholder="레터링 내용 / 컬러 색을 적어주세요"
                      value={example}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {example.length}/100
                    </span>
                  </span>
                </label>
              </>
            ) : type === "IMAGE" ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    옵션명
                    <span className="relative -top-1 text-[15px] leading-4 font-semibold text-text-error">
                      *
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="사진첨부"
                      value={label}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {label.length}/100
                    </span>
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-4">
                    <div className="flex w-[43px] shrink-0 flex-col gap-4">
                      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                        가격
                      </span>
                      <PriceToggle
                        checked={priceMode === "FIXED"}
                        onClick={() => {
                          setPrice("");
                          setPriceMode((currentMode) =>
                            currentMode === "FIXED" ? "INQUIRY" : "FIXED",
                          );
                        }}
                      />
                    </div>
                    <span className="flex min-w-0 flex-1 flex-col items-end gap-1 pt-6">
                      <Input
                        className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                        disabled={priceMode === "INQUIRY"}
                        inputMode="numeric"
                        maxLength={100}
                        onChange={(event) =>
                          setPrice(formatNumericPrice(event.target.value))
                        }
                        placeholder={
                          priceMode === "INQUIRY" ? "문의필요" : "2,000"
                        }
                        value={priceMode === "INQUIRY" ? "" : price}
                      />
                      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                        {priceMode === "INQUIRY" ? 0 : price.length}/100
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                    토글이 비활성화 된 상태는 나중에 가격을 기입해야해요
                  </p>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    서브 설명
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="원하는 디자인 이미지를 첨부해주세요"
                      value={description}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {description.length}/100
                    </span>
                  </span>
                </label>
              </>
            ) : type === "TEXTAREA" ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    설명예시
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Textarea
                      className="min-h-[88px] resize-none border-0 bg-surface-subtle px-4 py-2 placeholder:text-text-unavailable"
                      maxLength={500}
                      onChange={(event) => setExample(event.target.value)}
                      placeholder="레터링 내용 / 컬러 색을 적어주세요"
                      value={example}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {example.length}/500
                    </span>
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    서브 설명
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="요청사항에 미작성시 반영되지 않습니다"
                      value={description}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {description.length}/100
                    </span>
                  </span>
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    옵션명
                    <span className="relative -top-1 text-[15px] leading-4 font-semibold text-text-error">
                      *
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="옵션 1"
                      value={label}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {label.length}/100
                    </span>
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    가격
                    <span className="relative -top-1 text-[15px] leading-4 font-semibold text-text-error">
                      *
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      inputMode="numeric"
                      maxLength={100}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="38,000"
                      value={price}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {price.length}/100
                    </span>
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                    서브 설명
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Input
                      className="border-0 bg-surface-subtle px-4 placeholder:text-text-unavailable"
                      maxLength={100}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="2-3인 추천"
                      value={description}
                    />
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                      {description.length}/100
                    </span>
                  </span>
                </label>
              </>
            )}
          </div>
          <Button
            className="h-[52px] w-full rounded-seller-md text-seller-heading-md font-semibold"
            disabled={isCompleteDisabled}
            onClick={completeOption}
            size="md"
          >
            확인
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
