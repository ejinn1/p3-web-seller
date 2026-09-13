"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "@/components/common/field";
import { Input } from "@/components/common/input";
import {
  formatBusinessRegistrationNumber,
  onlyDigits,
  settlementAccountSchema,
  toSettlementAccountInput,
  type SettlementAccountFormValues,
} from "@/features/settlement-account/model/settlement-account-schema";
import type {
  SettlementAccount,
  SettlementAccountInput,
  SettlementBank,
} from "@/features/settlement-account/model/settlement-account-types";
import { SettlementBankSheet } from "@/features/settlement-account/ui/settlement-bank-sheet";

type SettlementAccountFormProps = {
  account?: SettlementAccount | null;
  banks: SettlementBank[];
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (input: SettlementAccountInput) => Promise<void>;
};

const fieldLabelClassName =
  "text-seller-heading-md leading-6 font-semibold tracking-[-0.54px]";

export function SettlementAccountForm({
  account,
  banks,
  errorMessage,
  isPending,
  onSubmit,
}: SettlementAccountFormProps) {
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const form = useForm<SettlementAccountFormValues>({
    resolver: zodResolver(settlementAccountSchema),
    mode: "onChange",
    defaultValues: {
      bankCode: account?.bankCode ?? "",
      accountNumber: "",
      accountHolderName: account?.accountHolderName ?? "",
      businessRegistrationNumber: "",
    },
  });
  const bankCode = useWatch({ control: form.control, name: "bankCode" });
  const selectedBank = banks.find((bank) => bank.code === bankCode);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(toSettlementAccountInput(values));
      form.reset();
    } catch {
      // Mutation errors are rendered below the form.
    }
  });

  return (
    <>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
        <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-6 pb-4">
          <Field
            error={form.formState.errors.bankCode?.message}
            label="은행선택"
            labelClassName={fieldLabelClassName}
            required
          >
            <button
              aria-haspopup="dialog"
              className="flex h-11 w-full items-center gap-5 border-b border-border-default py-1 pl-4 text-left text-base leading-6 tracking-[-0.32px]"
              onClick={() => setIsBankSheetOpen(true)}
              type="button"
            >
              <span
                className={
                  selectedBank
                    ? "flex-1 text-text-primary"
                    : "flex-1 text-text-unavailable"
                }
              >
                {selectedBank?.name ?? "은행을 선택해 주세요"}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="size-12 shrink-0 p-3 text-icon-default"
              />
            </button>
          </Field>

          <Field
            error={form.formState.errors.accountNumber?.message}
            htmlFor="settlement-account-number"
            label="계좌번호"
            labelClassName={fieldLabelClassName}
            required
          >
            <Input
              autoComplete="off"
              className="border-0 bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] placeholder:text-text-unavailable focus:ring-2 focus:ring-brand-primary/20"
              error={Boolean(form.formState.errors.accountNumber)}
              id="settlement-account-number"
              inputMode="numeric"
              maxLength={16}
              placeholder="계좌번호 숫자로 입력해 주세요"
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
            labelClassName={fieldLabelClassName}
            required
          >
            <Input
              autoComplete="off"
              className="border-0 bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] placeholder:text-text-unavailable focus:ring-2 focus:ring-brand-primary/20"
              error={Boolean(form.formState.errors.accountHolderName)}
              id="settlement-account-holder"
              maxLength={50}
              placeholder="예금주명을 입력해 주세요"
              {...form.register("accountHolderName")}
            />
          </Field>

          <Field
            error={form.formState.errors.businessRegistrationNumber?.message}
            htmlFor="settlement-business-number"
            label="사업자등록번호"
            labelClassName={fieldLabelClassName}
            required
          >
            <Input
              autoComplete="off"
              className="border-0 bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] placeholder:text-text-unavailable focus:ring-2 focus:ring-brand-primary/20"
              error={Boolean(form.formState.errors.businessRegistrationNumber)}
              id="settlement-business-number"
              inputMode="numeric"
              maxLength={12}
              placeholder="사업자등록번호 숫자 10자리"
              {...form.register("businessRegistrationNumber", {
                onChange: (event) => {
                  event.target.value = formatBusinessRegistrationNumber(
                    event.target.value,
                  );
                },
              })}
            />
          </Field>

          {errorMessage ? (
            <p aria-live="polite" className="text-sm text-text-error">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <div className="px-4 pt-4 pb-[34px]">
          <button
            className="flex h-[52px] w-full items-center justify-center rounded-seller-md bg-brand-primary px-6 text-seller-heading-md leading-6 font-semibold tracking-[-0.54px] text-text-inverse disabled:bg-brand-disabled disabled:text-text-disabled"
            disabled={!form.formState.isValid || isPending}
            type="submit"
          >
            {isPending ? "등록 중..." : "다음"}
          </button>
        </div>
      </form>

      {isBankSheetOpen ? (
        <SettlementBankSheet
          banks={banks}
          onConfirm={(nextBankCode) => {
            form.setValue("bankCode", nextBankCode, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
          onOpenChange={setIsBankSheetOpen}
          selectedBankCode={bankCode}
        />
      ) : null}
    </>
  );
}
