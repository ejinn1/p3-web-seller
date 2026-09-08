import { ChevronRight } from "lucide-react";
import type { InquiryDocumentMode } from "@/features/inquiries/model/inquiry-detail-state";
import { formatInquiryPrice } from "@/features/inquiries/model/inquiry-order-confirmation";
import type {
  InquiryOrderConfirmation,
  InquiryOrderOption,
} from "@/features/inquiries/model/inquiry-types";
import { cn } from "@/lib/utils";

export function InquiryOrderCard({
  mode,
  onOpenPrice,
  order,
}: {
  mode: InquiryDocumentMode;
  onOpenPrice?: () => void;
  order: InquiryOrderConfirmation;
}) {
  if (mode === "order-form") {
    return <OrderFormCard onOpenPrice={onOpenPrice} order={order} />;
  }

  const showFinalTotal =
    mode === "confirmation-priced" ||
    mode === "confirmation-view" ||
    mode === "order-history";

  return (
    <article className="w-full rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
        <p>{order.pickupDate}</p>
        <p>{order.pickupTime}</p>
      </div>
      <div className="mt-8 space-y-1">
        <InfoLine label="주문자" value={order.buyerName} />
        <InfoLine label="연락처" value={order.buyerPhone || "정보 없음"} />
      </div>
      <div className="mt-8 h-px bg-surface-subtle opacity-90" />
      <div className="mt-8 space-y-6">
        {order.options.map((option) => (
          <ConfirmationOptionRow
            key={option.id}
            mode={mode}
            onOpenPrice={option.needsPrice ? onOpenPrice : undefined}
            option={option}
          />
        ))}
      </div>
      {showFinalTotal ? (
        <>
          <div className="h-px bg-surface-subtle opacity-90" />
          <div className="flex items-center justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
            <p>최종 가격</p>
            <p>{formatInquiryPrice(order.totalPrice)}</p>
          </div>
        </>
      ) : null}
    </article>
  );
}

function OrderFormCard({
  onOpenPrice,
  order,
}: {
  onOpenPrice?: () => void;
  order: InquiryOrderConfirmation;
}) {
  return (
    <article className="min-h-[696px] w-full rounded-seller-sm bg-surface-default px-4 pt-6 pb-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="space-y-12">
        <OrderFormSection
          price={order.pickupTime}
          title="픽업 일시"
          value={order.pickupDate}
        />
        {order.options.map((option) => (
          <OrderFormSection
            key={option.id}
            onClick={option.needsPrice ? onOpenPrice : undefined}
            price={option.priceText || (option.needsPrice ? "문의 필요" : "")}
            required={option.required}
            title={option.label}
            value={option.value}
          />
        ))}
      </div>
    </article>
  );
}

function OrderFormSection({
  onClick,
  price,
  required,
  title,
  value,
}: {
  onClick?: () => void;
  price: string;
  required?: boolean;
  title: string;
  value: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-1 text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
        {title}
        {required ? (
          <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
      </h2>
      <button
        className="flex h-6 w-full items-center gap-4 text-left"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        <span className="relative size-4 shrink-0 rounded-full border-2 border-border-default">
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-default" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary">
          {value}
        </span>
        {price ? (
          <span
            className={cn(
              "shrink-0 text-right text-[15px] leading-[22px] font-semibold tracking-[-0.15px]",
              title === "픽업 일시"
                ? "text-text-secondary"
                : "text-text-primary",
            )}
          >
            {price}
          </span>
        ) : null}
      </button>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {label}
      </p>
      <p className="text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {value}
      </p>
    </div>
  );
}

function ConfirmationOptionRow({
  mode,
  onOpenPrice,
  option,
}: {
  mode: InquiryDocumentMode;
  onOpenPrice?: () => void;
  option: InquiryOrderOption;
}) {
  const needsPrice = mode === "confirmation-draft" && option.needsPrice;
  const showPrice = !option.needsPrice || mode !== "confirmation-draft";

  return (
    <div className="space-y-2">
      <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
        {option.label}
      </p>
      <button
        className="flex min-h-6 w-full items-center justify-between text-left"
        disabled={!onOpenPrice}
        onClick={onOpenPrice}
        type="button"
      >
        <span className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {option.value}
        </span>
        {showPrice ? (
          <span className="text-[15px] leading-[22px] font-semibold tracking-[-0.15px] text-text-disabled">
            {option.priceText}
          </span>
        ) : (
          <ChevronRight
            aria-hidden="true"
            className="size-6 text-text-secondary"
          />
        )}
      </button>
      {needsPrice ? (
        <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-error">
          가격을 입력해주세요
        </p>
      ) : null}
    </div>
  );
}
