"use client";

import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import type {
  OrderFormDraftOption,
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

export function OrderFormOptionSheet({
  initialOption,
  onComplete,
  onOpenChange,
  open,
}: OrderFormOptionSheetProps) {
  const [label, setLabel] = useState(initialOption?.label ?? "");
  const [price, setPrice] = useState(initialOption?.price ?? "");
  const [description, setDescription] = useState(
    initialOption?.description ?? "",
  );
  const [example, setExample] = useState(initialOption?.example ?? "");
  const [imageCount, setImageCount] = useState(initialOption?.imageCount ?? 1);
  const [type, setType] = useState<OrderFormDraftOptionType>(
    initialOption?.type ?? "SELECT",
  );

  const completeOption = () => {
    if (
      type === "TEXTAREA" ? !example.trim() : !label.trim() || !price.trim()
    ) {
      return;
    }

    onComplete({
      description: description.trim(),
      example: example.trim(),
      imageCount,
      label: label.trim(),
      price,
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
                onClick={() => setType(optionType.type)}
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
                <div className="flex gap-4">
                  <label className="flex min-w-0 flex-1 flex-col gap-2">
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
                        placeholder="문의필요"
                        value={price}
                      />
                      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
                        {price.length}/100
                      </span>
                    </span>
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                      사진 첨부수량
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="사진 첨부수량 줄이기"
                        className="flex size-11 shrink-0 items-center justify-center rounded-seller-sm bg-surface-subtle text-text-tertiary disabled:text-text-unavailable"
                        disabled={imageCount === 1}
                        onClick={() =>
                          setImageCount((count) => Math.max(1, count - 1))
                        }
                        type="button"
                      >
                        <Minus
                          aria-hidden="true"
                          className="size-6"
                          strokeWidth={2}
                        />
                      </button>
                      <div className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-seller-sm bg-surface-subtle text-seller-heading-lg font-bold tracking-[-0.2px]">
                        {imageCount}
                      </div>
                      <button
                        aria-label="사진 첨부수량 늘리기"
                        className="flex size-11 shrink-0 items-center justify-center rounded-seller-sm bg-surface-subtle text-text-tertiary disabled:text-text-unavailable"
                        disabled={imageCount === 3}
                        onClick={() =>
                          setImageCount((count) => Math.min(3, count + 1))
                        }
                        type="button"
                      >
                        <Plus
                          aria-hidden="true"
                          className="size-6"
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>
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
              </>
            )}
          </div>
          <Button
            className="h-[52px] w-full rounded-seller-md text-seller-heading-md font-semibold"
            disabled={
              type === "TEXTAREA"
                ? !example.trim()
                : !label.trim() || !price.trim()
            }
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
