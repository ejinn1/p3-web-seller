import { ApiError } from "@/lib/api/types";

const activationErrorMessages: Record<string, string> = {
  STORE_INFORMATION_REQUIRED_400:
    "스토어 정보와 영업시간, 환불 정책을 모두 등록해 주세요.",
  ACTIVE_ORDER_FORM_REQUIRED_400: "활성 주문서를 먼저 등록해 주세요.",
  ENABLED_PICKUP_SETTING_REQUIRED_400:
    "영업일과 영업시간을 먼저 등록해 주세요.",
  OPERATION_SETTING_REQUIRED_400: "스토어 운영 설정을 먼저 등록해 주세요.",
  ORDER_NOTICE_REQUIRED_400: "공지사항을 모두 등록해 주세요.",
  REPRESENTATIVE_IMAGE_MINIMUM_REQUIRED_400:
    "대표사진을 3장 이상 등록해 주세요.",
  SETTLEMENT_ACCOUNT_REQUIRED_400: "정산 계좌를 먼저 등록해 주세요.",
};

export function getStoreActivationErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "로그인 세션을 확인할 수 없습니다. 다시 로그인해 주세요.";
    }

    if (error.code && activationErrorMessages[error.code]) {
      return activationErrorMessages[error.code];
    }
  }

  return "스토어를 열지 못했습니다. 설정 내용을 확인한 뒤 다시 시도해 주세요.";
}
