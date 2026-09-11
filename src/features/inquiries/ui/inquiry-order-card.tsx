import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { InquiryDocumentMode } from "@/features/inquiries/model/inquiry-detail-state";
import { formatInquiryPrice } from "@/features/inquiries/model/inquiry-order-confirmation";
import type {
  InquiryOrderConfirmation,
  InquiryOrderOption,
  InquiryReferenceAssetPreview,
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
  const isConfirmationEditor =
    mode === "confirmation-draft" || mode === "confirmation-priced";

  return (
    <article className="w-full rounded-seller-sm bg-surface-default px-4 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div
        className={cn(
          "flex justify-between font-bold text-text-primary",
          isConfirmationEditor
            ? "text-[16px] leading-6 tracking-[-0.32px]"
            : "text-[22px] leading-[30px] tracking-[-0.66px]",
        )}
      >
        <p>{order.pickupDate}</p>
        <p>{order.pickupTime}</p>
      </div>
      <div className="mt-8 space-y-1">
        <InfoLine label="주문자" value={order.buyerName} />
        <InfoLine label="연락처" value={order.buyerPhone || "정보 없음"} />
      </div>
      {!isConfirmationEditor ? (
        <div className="mt-8 h-px bg-surface-subtle opacity-90" />
      ) : null}
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
          <div
            className={cn(
              "h-px bg-surface-subtle opacity-90",
              isConfirmationEditor && "mt-8",
            )}
          />
          <div
            className={cn(
              "flex items-center justify-between text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary",
              isConfirmationEditor && "pt-8",
            )}
          >
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
            assets={option.assetPreviews}
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
  assets,
  onClick,
  price,
  required,
  title,
  value,
}: {
  assets?: InquiryReferenceAssetPreview[];
  onClick?: () => void;
  price: string;
  required?: boolean;
  title: string;
  value: string;
}) {
  const showRadio = price !== "문의 필요";

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
        className="flex h-6 w-full items-center justify-between overflow-visible text-left"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        <span className="flex h-11 min-w-0 shrink items-center justify-end">
          {showRadio ? (
            <span className="relative size-8 shrink-0" aria-hidden="true">
              <Image
                alt=""
                className="absolute top-[7px] left-0 size-[18px]"
                height={18}
                src="/order-form/radio-checked.svg"
                width={18}
              />
            </span>
          ) : null}
          <span className="min-w-0 truncate text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary">
            {value}
          </span>
        </span>
        {price ? (
          <span
            className={cn(
              "min-w-px shrink-0 text-right text-[15px] font-semibold",
              title === "픽업 일시"
                ? "ml-auto leading-5 tracking-[-0.3px] text-text-secondary"
                : "flex-1 leading-[22px] tracking-[-0.15px] text-text-primary",
            )}
          >
            {price}
          </span>
        ) : null}
      </button>
      <ReferenceAssetPreviewList assets={assets} size="lg" />
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
          <span className="-my-3 flex size-12 shrink-0 items-center justify-center">
            <ChevronRight
              aria-hidden="true"
              className="size-6 text-text-secondary"
            />
          </span>
        )}
      </button>
      <ReferenceAssetPreviewList
        assets={option.assetPreviews}
        size="lg"
      />
    </div>
  );
}

function ReferenceAssetPreviewList({
  assets,
  size = "sm",
}: {
  assets?: InquiryReferenceAssetPreview[];
  size?: "sm" | "lg";
}) {
  if (!assets?.length) {
    return null;
  }

  return (
    <div
      className={cn("flex gap-2 overflow-x-auto pb-1", size === "lg" && "mt-4")}
      data-qa="order-assets"
    >
      {assets.map((asset, index) => (
        <div
          className={cn(
            "shrink-0 overflow-hidden rounded-seller-sm bg-surface-subtle",
            size === "lg" ? "size-[100px]" : "size-16",
          )}
          key={`${asset.assetId}-${index}`}
        >
          {asset.deliveryUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="첨부 이미지 미리보기"
              className="size-full object-cover"
              src={asset.deliveryUrl}
            />
          ) : (
            <span className="flex size-full items-center justify-center px-2 text-center text-[11px] leading-4 text-text-tertiary">
              {["PROCESSING", "UPLOADED"].includes(asset.status)
                ? "이미지 처리 중"
                : "이미지를 불러올 수 없어요"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
