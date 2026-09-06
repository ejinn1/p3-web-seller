import { Button } from "@/components/ui/button";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import type { Store } from "@/features/store/model/store-types";

type StoreInformationFormProps = {
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
  placeholder: string;
  value?: string | null;
  onClick?: () => void;
};

function StoreInformationField({
  label,
  maxLength,
  placeholder,
  value,
  onClick,
}: StoreInformationFieldProps) {
  const displayValue = value ?? "";
  const content = (
    <>
      <span
        className={
          displayValue
            ? "truncate text-text-primary"
            : "truncate text-text-unavailable"
        }
      >
        {displayValue || placeholder}
      </span>
      <span className="shrink-0 text-text-unavailable">
        {displayValue.length}/{maxLength}
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center text-seller-heading-md font-semibold tracking-[-0.54px]">
        <span
          aria-hidden="true"
          className="w-[9px] pb-1 text-[15px] leading-5 text-text-error"
        >
          *
        </span>
        {label}
      </p>
      {onClick ? (
        <button
          className="flex h-11 w-full items-center justify-between gap-3 rounded-seller-sm bg-surface-subtle px-4 text-left text-base leading-6 tracking-[-0.32px]"
          onClick={onClick}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className="flex h-11 w-full items-center justify-between gap-3 rounded-seller-sm bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px]">
          {content}
        </div>
      )}
    </div>
  );
}

export function StoreInformationForm({
  pickupAddress,
  refundPeriod,
  store,
  storeQueryIsError,
  onBusinessHoursClick,
  onPickupLocationClick,
  onRefundPeriodClick,
}: StoreInformationFormProps) {
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
          placeholder="환불기간을 설정해주세요"
          value={refundPeriod}
          onClick={onRefundPeriodClick}
        />
        <StoreInformationField
          label="매장 소개"
          maxLength={500}
          placeholder="매장 소개를 입력해주세요"
          value={store?.description}
        />
        {storeQueryIsError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            스토어 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
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
