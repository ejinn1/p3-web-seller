import { z } from "zod";
import type { SettlementAccountInput } from "@/features/settlement-account/model/settlement-account-types";

const accountNumberPattern = /^[0-9]{1,16}$/;
const businessRegistrationNumberPattern = /^[0-9]{10}$/;

export const settlementAccountSchema = z
  .object({
    bankCode: z.string().min(1, "은행을 선택해 주세요."),
    accountNumber: z
      .string()
      .min(1, "계좌번호를 입력해 주세요.")
      .refine(
        (value) => accountNumberPattern.test(onlyDigits(value)),
        "계좌번호는 숫자 16자리 이내로 입력해 주세요.",
      ),
    accountHolderName: z.string().trim().min(1, "예금주명을 입력해 주세요."),
    businessRegistrationNumber: z
      .string()
      .min(1, "사업자등록번호를 입력해 주세요."),
  })
  .superRefine((values, context) => {
    if (
      !businessRegistrationNumberPattern.test(
        onlyDigits(values.businessRegistrationNumber),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "사업자등록번호 숫자 10자리를 입력해 주세요.",
        path: ["businessRegistrationNumber"],
      });
    }
  });

export type SettlementAccountFormValues = z.infer<
  typeof settlementAccountSchema
>;

export function toSettlementAccountInput(
  values: SettlementAccountFormValues,
): SettlementAccountInput {
  return {
    bankCode: values.bankCode,
    accountNumber: onlyDigits(values.accountNumber),
    accountHolderName: values.accountHolderName.trim(),
    businessRegistrationNumber: onlyDigits(values.businessRegistrationNumber),
  };
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatBusinessRegistrationNumber(value: string) {
  const digits = onlyDigits(value).slice(0, 10);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
