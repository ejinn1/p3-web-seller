import { Check } from "lucide-react";
import { Button } from "@/components/common/button";
import type { SettlementAccount } from "@/features/settlement-account/model/settlement-account-types";

type SettlementAccountSummaryProps = {
  account: SettlementAccount;
  onChange: () => void;
};

export function SettlementAccountSummary({
  account,
  onChange,
}: SettlementAccountSummaryProps) {
  return (
    <section className="flex flex-1 flex-col px-4 pt-6 pb-[34px]">
      <div className="rounded-seller-md bg-surface-subtle p-5">
        <div className="mb-6 flex items-center gap-2 text-seller-heading-md font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-status-success text-text-inverse">
            <Check aria-hidden="true" className="size-4" strokeWidth={3} />
          </span>
          인증 완료
        </div>
        <dl className="grid grid-cols-[96px_1fr] gap-y-4 text-seller-body-md">
          <dt className="text-text-secondary">은행</dt>
          <dd className="font-semibold text-text-primary">
            {account.bankName}
          </dd>
          <dt className="text-text-secondary">계좌번호</dt>
          <dd className="font-semibold text-text-primary">
            {account.accountNumberMasked}
          </dd>
          <dt className="text-text-secondary">예금주</dt>
          <dd className="font-semibold text-text-primary">
            {account.accountHolderName}
          </dd>
          <dt className="text-text-secondary">명의 유형</dt>
          <dd className="font-semibold text-text-primary">
            {account.holderType === "PERSONAL" ? "개인" : "사업자"}
          </dd>
          <dt className="text-text-secondary">인증일</dt>
          <dd className="font-semibold text-text-primary">
            {formatVerifiedAt(account.verifiedAt)}
          </dd>
        </dl>
      </div>
      <p className="mt-4 text-seller-body-md text-text-secondary">
        계좌를 변경하면 새 계좌의 실명 인증을 다시 진행합니다.
      </p>
      <div className="mt-auto pt-8">
        <Button fullWidth onClick={onChange} size="lg" variant="secondary">
          변경하기
        </Button>
      </div>
    </section>
  );
}

function formatVerifiedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
