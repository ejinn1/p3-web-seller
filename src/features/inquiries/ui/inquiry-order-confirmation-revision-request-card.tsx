export function InquiryOrderConfirmationRevisionRequestCard({
  disabled,
  onEdit,
}: {
  disabled: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex w-60 shrink-0 flex-col gap-4 rounded-seller-lg bg-surface-default p-4">
      <div className="flex w-[208px] flex-col gap-2">
        <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-secondary">
          수정 요청
        </p>
        <p className="text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
          주문확인서를 수정해주세요
        </p>
        <p className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
          주문확인서 수정을 요청했어요
        </p>
      </div>
      <button
        className="h-9 w-full rounded-seller-lg border border-border-default bg-surface-default px-4 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary disabled:text-text-disabled"
        disabled={disabled}
        onClick={onEdit}
        type="button"
      >
        주문확인서 수정하기
      </button>
    </div>
  );
}
