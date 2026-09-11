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
    holderType: z.enum(["PERSONAL", "BUSINESS"]),
    birthDate: z.string(),
    businessRegistrationNumber: z.string(),
  })
  .superRefine((values, context) => {
    if (values.holderType === "PERSONAL") {
      if (!values.birthDate) {
        context.addIssue({
          code: "custom",
          message: "생년월일을 입력해 주세요.",
          path: ["birthDate"],
        });
        return;
      }

      if (values.birthDate >= today()) {
        context.addIssue({
          code: "custom",
          message: "과거 생년월일을 입력해 주세요.",
          path: ["birthDate"],
        });
      }
      return;
    }

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
  const common = {
    bankCode: values.bankCode,
    accountNumber: onlyDigits(values.accountNumber),
    accountHolderName: values.accountHolderName.trim(),
  };

  if (values.holderType === "PERSONAL") {
    return {
      ...common,
      holderType: "PERSONAL",
      birthDate: values.birthDate,
    };
  }

  return {
    ...common,
    holderType: "BUSINESS",
    businessRegistrationNumber: onlyDigits(values.businessRegistrationNumber),
  };
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
