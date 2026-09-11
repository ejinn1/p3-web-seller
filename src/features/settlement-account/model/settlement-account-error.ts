import { ApiError } from "@/lib/api/types";

const settlementAccountErrorMessages: Record<string, string> = {
  SETTLEMENT_BANK_UNSUPPORTED_400:
    "지원하지 않는 은행입니다. 은행을 다시 선택해 주세요.",
  SETTLEMENT_ACCOUNT_INPUT_INVALID_400: "입력한 계좌정보를 다시 확인해 주세요.",
  COMMON_INVALID_INPUT_400: "입력한 정보를 다시 확인해 주세요.",
  ACCOUNT_HOLDER_MISMATCH_400:
    "입력한 예금주명과 실제 예금주명이 일치하지 않습니다.",
  ACCOUNT_VERIFICATION_REJECTED_400:
    "계좌를 인증하지 못했습니다. 계좌정보를 확인해 주세요.",
  ACCOUNT_VERIFICATION_CONFIGURATION_INVALID_500:
    "계좌 인증 설정에 문제가 있습니다. 잠시 후 다시 시도해 주세요.",
  ACCOUNT_VERIFICATION_UNAVAILABLE_502:
    "금융기관 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
};

export function getSettlementAccountErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "로그인 세션을 확인할 수 없습니다. 다시 로그인해 주세요.";
    }

    if (error.code && settlementAccountErrorMessages[error.code]) {
      return settlementAccountErrorMessages[error.code];
    }
  }

  return "계좌정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
