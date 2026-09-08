import { cn } from "@/lib/utils";

export function InquiryPaymentRequestModal({
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
}: {
  errorMessage?: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-scrim px-8">
      <div className="flex w-full flex-col items-center gap-6 rounded-seller-lg bg-surface-default py-8">
        <div className="w-full space-y-1 text-center">
          <h2 className="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary">
            결제 요청을 진행하시겠어요?
          </h2>
          <p className="text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-secondary">
            결제를 요청하시면 주문확인서가 확정됩니다
          </p>
          {errorMessage ? (
            <p className="px-4 pt-3 text-[13px] leading-[18px] font-normal tracking-[-0.13px] text-text-error">
              {errorMessage}
            </p>
          ) : null}
        </div>
        <div className="flex w-full gap-2 px-4">
          <button
            className="h-11 flex-1 rounded-seller-md border border-border-default bg-surface-default text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className={cn(
              "h-11 flex-1 rounded-seller-md bg-brand-primary text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled",
            )}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "요청 중" : "계속하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
