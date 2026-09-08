"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common/button";
import { SettingRow } from "@/components/widgets/setting-row";
import { noticeCategories } from "@/features/notice/model/notice-categories";
import { useNoticeDraftStore } from "@/features/notice/model/notice-draft";
import { useUpdateNoticesMutation } from "@/features/notice/model/notice-mutations";
import { toUpdateNoticesInput } from "@/features/notice/model/notice-response";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";

export function NoticeHomeScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const itemsByType = useNoticeDraftStore((state) => state.itemsByType);
  const updateNoticesMutation = useUpdateNoticesMutation();
  const storeName = statusQuery.data?.storeName ?? "스토어";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader backHref="/seller/store-management" />
      <section className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-6 pb-4">
        <div className="space-y-2">
          <h1 className="text-seller-display-lg font-bold tracking-[-0.84px] whitespace-pre-line">
            {`‘${storeName}’의\n공지사항을 작성해주세요`}
          </h1>
          <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
            손님이 주문할 때 채우는 주문서 양식을 만들어보세요
          </p>
        </div>
        <div className="space-y-2">
          {noticeCategories.map((category) => (
            <SettingRow
              completed={
                itemsByType[category.type]?.some((item) => item.trim()) ?? false
              }
              href={`/seller/notice/${category.slug}`}
              key={category.type}
              label={category.label}
            />
          ))}
        </div>
      </section>
      <div className="flex flex-col gap-2 px-4 pt-4 pb-[34px]">
        {updateNoticesMutation.error ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {updateNoticesMutation.error instanceof Error
              ? updateNoticesMutation.error.message
              : "공지사항을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
            onClick={() => router.push("/seller/notice/preview")}
            size="md"
            variant="outline"
          >
            미리보기
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
            disabled={updateNoticesMutation.isPending}
            onClick={() =>
              updateNoticesMutation.mutate(toUpdateNoticesInput(itemsByType), {
                onSuccess: () => router.push("/seller/store-management"),
              })
            }
            size="md"
          >
            {updateNoticesMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </main>
  );
}
