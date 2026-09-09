"use client";

import { Button } from "@/components/common/button";
import { useRouter } from "next/navigation";
import {
  useCompleteAccountRegistrationMutation,
  useUpdateStoreStatusMutation,
} from "@/features/store/model/store-mutations";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { StoreManagementHeader } from "@/features/store/ui/store-management-header";
import { SettingRow } from "@/components/widgets/setting-row";
import { ApiError } from "@/lib/api/types";
import {
  getSellerBackHref,
  getSellerStoreManagementBackHref,
} from "@/lib/navigation/seller-back-routes";

export function StoreManagementScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const completeAccountRegistrationMutation =
    useCompleteAccountRegistrationMutation();
  const updateStoreStatusMutation = useUpdateStoreStatusMutation();
  const managementStatus = statusQuery.data;
  const items = managementStatus?.items;
  const settings = [
    {
      completed: items?.storeInfo ?? false,
      href: "/seller/store-information",
      label: "스토어 정보",
    },
    {
      completed: items?.orderForm ?? false,
      href: "/seller/order-form",
      label: "주문서 양식",
    },
    {
      completed: items?.notice ?? false,
      href: "/seller/notice",
      label: "공지사항",
    },
    {
      completed: items?.photoRegistration ?? false,
      href: "/seller/photo-registration/representative",
      label: "사진등록",
    },
    {
      completed: items?.settlementAccount ?? false,
      disabled:
        (items?.settlementAccount ?? false) ||
        completeAccountRegistrationMutation.isPending,
      label: "계좌등록",
      onClick: () => void completeAccountRegistrationMutation.mutateAsync(),
    },
  ];
  const completedCount = managementStatus?.completedCount ?? 0;
  const totalCount = managementStatus?.totalCount ?? settings.length;
  const storeName = managementStatus?.storeName ?? "스토어";
  const canEnterSellerHome = managementStatus?.canActivate ?? false;
  const activationErrorMessage = getActivationErrorMessage(
    updateStoreStatusMutation.error,
  );

  const activateStore = () => {
    updateStoreStatusMutation.mutate("ACTIVE", {
      onSuccess: () => router.push(getSellerBackHref("storeManagement")),
    });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <StoreManagementHeader
        backHref={getSellerStoreManagementBackHref(canEnterSellerHome)}
      />
      <section className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-6 pb-4">
        <div className="space-y-2">
          <h2 className="text-seller-display-lg font-bold tracking-[-0.84px] whitespace-pre-line">
            {`‘${storeName}’스토어\n정보를 채워주세요`}
          </h2>
          <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
            {statusQuery.isLoading
              ? "스토어 정보를 불러오고 있어요."
              : `${totalCount}개 중 ${completedCount}개를 채웠어요. 모두 채우면 스토어를 열 수 있어요.`}
          </p>
        </div>
        <div className="space-y-2">
          {settings.map((setting) => (
            <SettingRow key={setting.label} {...setting} />
          ))}
        </div>
        {completeAccountRegistrationMutation.isError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            계좌등록을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        {activationErrorMessage ? (
          <p
            aria-live="polite"
            className="mb-3 text-center text-sm text-text-error"
          >
            {activationErrorMessage}
          </p>
        ) : null}
        <Button
          className="h-11 rounded-seller-md text-[15px] font-semibold"
          disabled={
            statusQuery.isLoading ||
            !canEnterSellerHome ||
            updateStoreStatusMutation.isPending
          }
          fullWidth
          onClick={activateStore}
          size="md"
        >
          {updateStoreStatusMutation.isPending ? "저장 중" : "저장"}
        </Button>
      </div>
    </main>
  );
}

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

function getActivationErrorMessage(error: unknown) {
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
