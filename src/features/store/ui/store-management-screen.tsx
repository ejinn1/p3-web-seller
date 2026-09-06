"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCompleteAccountRegistrationMutation } from "@/features/store/model/store-mutations";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { StoreManagementHeader } from "@/features/store/ui/store-management-header";
import { SettingRow } from "@/components/ui/setting-row/setting-row";

export function StoreManagementScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const completeAccountRegistrationMutation =
    useCompleteAccountRegistrationMutation();
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <StoreManagementHeader />
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
        <Button
          className="h-11 rounded-seller-md text-[15px] font-semibold"
          fullWidth
          onClick={() => router.push("/seller/home")}
          size="md"
        >
          저장
        </Button>
      </div>
    </main>
  );
}
