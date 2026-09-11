"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/common/button";
import { Field } from "@/components/common/field";
import { Input } from "@/components/common/input";
import { Radio } from "@/components/common/radio";
import { Select } from "@/components/common/select";
import {
  onlyDigits,
  settlementAccountSchema,
  toSettlementAccountInput,
  type SettlementAccountFormValues,
} from "@/features/settlement-account/model/settlement-account-schema";
import type {
  SettlementAccount,
  SettlementAccountInput,
  SettlementBank,
  SettlementAccountHolderType,
} from "@/features/settlement-account/model/settlement-account-types";

type SettlementAccountFormProps = {
  account?: SettlementAccount | null;
  banks: SettlementBank[];
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (input: SettlementAccountInput) => Promise<void>;
};

const holderTypeOptions: Array<{
  label: string;
  value: SettlementAccountHolderType;
}> = [
  { label: "개인", value: "PERSONAL" },
  { label: "사업자", value: "BUSINESS" },
];

export function SettlementAccountForm({
  account,
  banks,
  errorMessage,
  isPending,
  onSubmit,
}: SettlementAccountFormProps) {
  const form = useForm<SettlementAccountFormValues>({
    resolver: zodResolver(settlementAccountSchema),
    mode: "onChange",
    defaultValues: {
      bankCode: account?.bankCode ?? "",
      accountNumber: "",
      accountHolderName: account?.accountHolderName ?? "",
      holderType: account?.holderType ?? "PERSONAL",
      birthDate: "",
      businessRegistrationNumber: "",
    },
  });
  const holderType = useWatch({
    control: form.control,
    name: "holderType",
  });

  const selectHolderType = (nextType: SettlementAccountHolderType) => {
    form.setValue("holderType", nextType, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("birthDate", "", { shouldValidate: true });
    form.setValue("businessRegistrationNumber", "", {
      shouldValidate: true,
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(toSettlementAccountInput(values));
      form.reset();
    } catch {
      // Mutation errors are rendered below the form.
    }
  });

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
      <section className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-6 pb-4">
        {account ? (
          <div className="rounded-seller-sm bg-surface-subtle px-4 py-3 text-seller-body-md text-text-secondary">
            변경할 계좌정보를 다시 입력해 주세요. 기존 계좌번호와 인증정보는
            불러오지 않습니다.
          </div>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="flex items-center gap-1 text-seller-heading-md font-semibold tracking-[-0.54px]">
            예금주 유형
            <span
              aria-hidden="true"
              className="relative -top-1 text-[15px] leading-5 text-text-error"
            >
              *
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {holderTypeOptions.map((option) => (
              <label
                className={`flex h-12 cursor-pointer items-center justify-center gap-1 rounded-seller-sm border text-seller-body-md font-semibold transition-colors ${
                  holderType === option.value
                    ? "border-border-strong bg-surface-subtle text-text-primary"
                    : "border-border-default bg-surface-default text-text-secondary"
                }`}
                key={option.value}
              >
                <Radio
                  checked={holderType === option.value}
                  name="holderType"
                  onChange={() => selectHolderType(option.value)}
                  value={option.value}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          error={form.formState.errors.bankCode?.message}
          htmlFor="settlement-bank"
          label="은행"
          labelClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
          required
        >
          <Select
            error={Boolean(form.formState.errors.bankCode)}
            id="settlement-bank"
            {...form.register("bankCode")}
          >
            <option value="">은행을 선택해 주세요</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          error={form.formState.errors.accountNumber?.message}
          htmlFor="settlement-account-number"
          label="계좌번호"
          labelClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
          required
        >
          <Input
            autoComplete="off"
            error={Boolean(form.formState.errors.accountNumber)}
            id="settlement-account-number"
            inputMode="numeric"
            maxLength={16}
            placeholder="계좌번호를 숫자로 입력해 주세요"
            {...form.register("accountNumber", {
              onChange: (event) => {
                event.target.value = onlyDigits(event.target.value).slice(
                  0,
                  16,
                );
              },
            })}
          />
        </Field>

        <Field
          error={form.formState.errors.accountHolderName?.message}
          htmlFor="settlement-account-holder"
          label="예금주명"
          labelClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
          required
        >
          <Input
            autoComplete="off"
            error={Boolean(form.formState.errors.accountHolderName)}
            id="settlement-account-holder"
            maxLength={50}
            placeholder="예금주명을 입력해 주세요"
            {...form.register("accountHolderName")}
          />
        </Field>

        {holderType === "PERSONAL" ? (
          <Field
            error={form.formState.errors.birthDate?.message}
            htmlFor="settlement-birth-date"
            label="생년월일"
            labelClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
            required
          >
            <Input
              autoComplete="bday"
              error={Boolean(form.formState.errors.birthDate)}
              id="settlement-birth-date"
              max={localToday()}
              type="date"
              {...form.register("birthDate")}
            />
          </Field>
        ) : (
          <Field
            error={form.formState.errors.businessRegistrationNumber?.message}
            htmlFor="settlement-business-number"
            label="사업자등록번호"
            labelClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
            required
          >
            <Input
              autoComplete="off"
              error={Boolean(form.formState.errors.businessRegistrationNumber)}
              id="settlement-business-number"
              inputMode="numeric"
              maxLength={10}
              placeholder="사업자등록번호 숫자 10자리"
              {...form.register("businessRegistrationNumber", {
                onChange: (event) => {
                  event.target.value = onlyDigits(event.target.value).slice(
                    0,
                    10,
                  );
                },
              })}
            />
          </Field>
        )}

        <p className="rounded-seller-sm bg-surface-subtle px-4 py-3 text-seller-body-md text-text-secondary">
          생년월일과 사업자등록번호는 계좌 인증에만 사용되며 저장되지 않습니다.
        </p>

        {errorMessage ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-11 rounded-seller-md text-[15px] font-semibold"
          disabled={!form.formState.isValid || isPending}
          fullWidth
          size="md"
          type="submit"
        >
          {isPending ? "인증 중..." : "계좌 인증 및 등록"}
        </Button>
      </div>
    </form>
  );
}

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
