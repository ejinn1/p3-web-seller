"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/button";
import { Header } from "@/components/common/header";
import { useUpdateStoreRefundPolicyMutation } from "@/features/store/model/store-mutations";
import { useStoreRefundPolicyQuery } from "@/features/store/model/store-queries";
import type {
  StoreRefundPolicy,
  StoreRefundPolicyInput,
  StoreRefundPolicyRule,
} from "@/features/store/model/store-types";
import { cn } from "@/lib/utils";

type StoreRefundPeriodScreenProps = {
  onBack: () => void;
  onConfirm: (summary: string) => void;
};

type StoreRefundPeriodFormProps = {
  isLoadError: boolean;
  isSaveError: boolean;
  isSaving: boolean;
  onBack: () => void;
  onConfirm: (summary: string) => void;
  onSave: (input: StoreRefundPolicyInput) => Promise<StoreRefundPolicy>;
  refundPolicy?: StoreRefundPolicy;
};

type RefundRule = {
  daysBefore: number | null;
  id: number;
  percentage: number;
};

const refundPercentages = [100, 80, 70, 50, 30];
const refundDays = Array.from({ length: 8 }, (_, index) => index);

function formatRefundPolicy(rules: StoreRefundPolicyRule[]) {
  return rules
    .map(
      (rule) =>
        `픽업일 ${rule.daysBeforePickup === 0 ? "당일" : `${rule.daysBeforePickup}일 전`}까지 ${rule.refundRate}% 환불`,
    )
    .join(", ");
}

function RefundRuleFields({
  index,
  rule,
  rules,
  onChange,
}: {
  index: number;
  rule: RefundRule;
  rules: RefundRule[];
  onChange: (nextRule: RefundRule) => void;
}) {
  const previousPercentage =
    index === 0 ? Number.POSITIVE_INFINITY : rules[index - 1].percentage;
  const nextPercentage = rules[index + 1]?.percentage ?? 0;
  const selectablePercentages = refundPercentages.filter(
    (percentage) =>
      percentage < previousPercentage && percentage > nextPercentage,
  );
  const hasValue = rule.daysBefore !== null;

  return (
    <div className="flex flex-col gap-2">
      {index === 0 ? (
        <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
          픽업 일 기준
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="relative flex h-11 w-[100px] items-center border-b border-border-default pl-2">
          <select
            aria-label={`환불 비율 ${index + 1}`}
            className="h-full w-full appearance-none bg-transparent pr-8 text-seller-display-sm font-bold tracking-[-0.66px] outline-none"
            onChange={(event) =>
              onChange({ ...rule, percentage: Number(event.target.value) })
            }
            value={rule.percentage}
          >
            {selectablePercentages.map((percentage) => (
              <option key={percentage} value={percentage}>
                {percentage}%
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-1 size-5 text-text-secondary"
            strokeWidth={1.8}
          />
        </span>
        <span className="relative flex h-11 min-w-0 flex-1 items-center border-b border-border-default pl-4">
          <select
            aria-label={`환불 기간 ${index + 1}`}
            className={cn(
              "h-full w-full appearance-none bg-transparent pr-10 text-base leading-6 tracking-[-0.32px] outline-none",
              hasValue ? "text-text-primary" : "text-text-unavailable",
            )}
            onChange={(event) =>
              onChange({
                ...rule,
                daysBefore:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
            value={rule.daysBefore ?? ""}
          >
            <option disabled hidden value="">
              7일 전
            </option>
            {refundDays.map((day) => (
              <option key={day} value={day}>
                {day === 0 ? "당일" : `${day}일 전`}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 size-5 text-text-secondary"
            strokeWidth={1.8}
          />
        </span>
      </div>
    </div>
  );
}

function StoreRefundPeriodForm({
  isLoadError,
  isSaveError,
  isSaving,
  onBack,
  onConfirm,
  onSave,
  refundPolicy,
}: StoreRefundPeriodFormProps) {
  const [rules, setRules] = useState<RefundRule[]>(() =>
    refundPolicy?.rules.length
      ? refundPolicy.rules.map((rule, index) => ({
          daysBefore: rule.daysBeforePickup,
          id: index + 1,
          percentage: rule.refundRate,
        }))
      : [{ daysBefore: null, id: 1, percentage: 100 }],
  );

  const isOrdered = rules.every((rule, index) => {
    if (index === 0) {
      return true;
    }

    const previousRule = rules[index - 1];

    return (
      previousRule.percentage > rule.percentage &&
      previousRule.daysBefore !== null &&
      rule.daysBefore !== null &&
      previousRule.daysBefore > rule.daysBefore
    );
  });
  const canSave =
    !isLoadError &&
    rules.every((rule) => rule.daysBefore !== null) &&
    isOrdered;
  const nextPercentage = refundPercentages.find(
    (percentage) => percentage < rules.at(-1)!.percentage,
  );

  const updateRule = (nextRule: RefundRule) => {
    setRules((currentRules) =>
      currentRules.map((rule) => (rule.id === nextRule.id ? nextRule : rule)),
    );
  };

  const addRule = () => {
    if (!nextPercentage) {
      return;
    }

    setRules((currentRules) => [
      ...currentRules,
      {
        daysBefore: null,
        id: Math.max(...currentRules.map((rule) => rule.id)) + 1,
        percentage: nextPercentage,
      },
    ]);
  };

  const handleConfirm = async () => {
    if (!canSave) {
      return;
    }

    try {
      const savedPolicy = await onSave({
        rules: rules.map((rule) => ({
          daysBeforePickup: rule.daysBefore!,
          refundRate: rule.percentage,
        })),
      });

      onConfirm(formatRefundPolicy(savedPolicy.rules));
      onBack();
    } catch {
      // The mutation state is rendered on the current screen.
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backLabel="이전 화면으로 돌아가기"
        className="border-none"
        onBack={onBack}
        title="환불기간"
      />
      <section className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-6 pb-4">
        <p className="flex text-seller-heading-md font-semibold tracking-[-0.54px]">
          환불정책
          <span
            aria-hidden="true"
            className="relative -top-1 text-[15px] text-text-error"
          >
            *
          </span>
        </p>
        <div className="flex flex-col gap-4">
          {rules.map((rule, index) => (
            <RefundRuleFields
              index={index}
              key={rule.id}
              onChange={updateRule}
              rule={rule}
              rules={rules}
            />
          ))}
        </div>
        {!isOrdered ? (
          <p aria-live="polite" className="text-sm text-text-error">
            환불 비율은 높은 순서로, 기간은 먼 날짜부터 설정해 주세요.
          </p>
        ) : null}
        {isLoadError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            환불정책을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {isSaveError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            환불정책을 저장하지 못했습니다. 입력값을 확인해 주세요.
          </p>
        ) : null}
        <button
          className="flex h-11 w-fit items-center justify-center rounded-seller-md bg-surface-inverse pr-4 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-inverse disabled:opacity-40"
          disabled={!nextPercentage}
          onClick={addRule}
          type="button"
        >
          <span className="flex size-11 items-center justify-center">
            <Plus aria-hidden="true" className="size-5" strokeWidth={2} />
          </span>
          옵션 추가
        </button>
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled={!canSave || isSaving}
          fullWidth
          onClick={() => void handleConfirm()}
          size="lg"
        >
          {isSaving ? "저장 중..." : "다음"}
        </Button>
      </div>
    </main>
  );
}

export function StoreRefundPeriodScreen({
  onBack,
  onConfirm,
}: StoreRefundPeriodScreenProps) {
  const refundPolicyQuery = useStoreRefundPolicyQuery();
  const updateRefundPolicyMutation = useUpdateStoreRefundPolicyMutation();

  if (refundPolicyQuery.isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
        <Header
          backLabel="이전 화면으로 돌아가기"
          className="border-none"
          onBack={onBack}
          title="환불기간"
        />
        <p className="px-4 pt-6 text-sm text-text-secondary">
          환불정책을 불러오고 있습니다.
        </p>
      </main>
    );
  }

  const refundPolicyKey = refundPolicyQuery.data
    ? JSON.stringify(refundPolicyQuery.data)
    : "new";

  return (
    <StoreRefundPeriodForm
      isLoadError={refundPolicyQuery.isError}
      isSaveError={updateRefundPolicyMutation.isError}
      isSaving={updateRefundPolicyMutation.isPending}
      key={refundPolicyKey}
      onBack={onBack}
      onConfirm={onConfirm}
      onSave={async (input) => updateRefundPolicyMutation.mutateAsync(input)}
      refundPolicy={refundPolicyQuery.data}
    />
  );
}
