import { Upload } from "lucide-react";
import type { OrderFormDraftOption } from "@/features/order-form/model/order-form-draft";
import { cn } from "@/lib/utils";

type OrderFormConfiguredOptionCardProps = OrderFormDraftOption & {
  index: number;
  onSelect: () => void;
  selected: boolean;
};

function formatPrice(price: string) {
  const trimmedPrice = price.trim();
  const normalizedPrice = trimmedPrice.replace(/,/g, "");

  if (!/^\d+$/.test(normalizedPrice)) {
    return trimmedPrice;
  }

  return `+ ${Number(normalizedPrice).toLocaleString("ko-KR")}원`;
}

export function OrderFormConfiguredOptionCard({
  description,
  example,
  index,
  label,
  onSelect,
  price,
  selected,
  type,
}: OrderFormConfiguredOptionCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-2 rounded-seller-md bg-surface-default p-4 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-seller-primary focus-visible:ring-offset-2",
      )}
      onClick={onSelect}
      type="button"
    >
      <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
        옵션 {index}
      </p>
      {type === "SELECT" || type === "SELECT_WITH_TEXT" ? (
        <div className="flex items-start justify-between gap-4 text-seller-heading-md font-semibold tracking-[-0.54px]">
          <p>{label}</p>
          <p className="shrink-0">{formatPrice(price)}</p>
        </div>
      ) : null}
      {type === "SELECT" && description ? (
        <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
          * {description}
        </p>
      ) : null}
      {type === "SELECT_WITH_TEXT" ? (
        <>
          <div className="flex h-11 w-full items-center rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] text-text-unavailable">
            {example || "설명예시를 입력해주세요"}
          </div>
          {description ? (
            <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
              * {description}
            </p>
          ) : null}
        </>
      ) : type === "IMAGE" ? (
        <>
          <div className="flex items-start justify-between gap-4 text-seller-heading-md font-semibold tracking-[-0.54px]">
            <p>{label || "사진첨부"}</p>
            <p className="shrink-0 text-[15px] leading-5 font-medium tracking-[-0.3px] text-text-tertiary">
              {price || "문의필요"}
            </p>
          </div>
          <div
            aria-label="사진 첨부"
            className="flex size-[100px] items-center justify-center rounded-seller-sm bg-surface-subtle text-text-tertiary"
            role="img"
          >
            <Upload aria-hidden="true" className="size-6" strokeWidth={2} />
          </div>
          {description ? (
            <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
              * {description}
            </p>
          ) : null}
        </>
      ) : type === "TEXTAREA" ? (
        <>
          <div className="min-h-[88px] w-full rounded-seller-sm bg-surface-subtle px-4 py-2 text-base leading-6 tracking-[-0.32px] text-text-unavailable">
            {example}
          </div>
          {description ? (
            <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
              * {description}
            </p>
          ) : null}
        </>
      ) : null}
    </button>
  );
}
