"use client";

import { Button } from "@/components/common/button";
import { SettingRow } from "@/components/widgets/setting-row";
import { useRouter } from "next/navigation";
import { orderFormCategories } from "@/features/order-form/model/order-form-categories";
import { useOrderFormDraftStore } from "@/features/order-form/model/order-form-draft";
import { useSaveOrderFormMutation } from "@/features/order-form/model/order-form-mutations";
import {
  buildCreateOrderFormInput,
  hasEveryOrderFormCategory,
} from "@/features/order-form/model/order-form-request";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function OrderFormScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const saveMutation = useSaveOrderFormMutation();
  const optionsByCategory = useOrderFormDraftStore(
    (state) => state.optionsByCategory,
  );
  const resetDraft = useOrderFormDraftStore((state) => state.resetDraft);
  const templateId = useOrderFormDraftStore((state) => state.templateId);
  const storeName = statusQuery.data?.storeName ?? "스토어";
  const isComplete = hasEveryOrderFormCategory(optionsByCategory);

  const saveOrderForm = () => {
    if (!statusQuery.data || !isComplete) {
      return;
    }

    saveMutation.mutate(
      {
        input: buildCreateOrderFormInput(
          statusQuery.data.storeName,
          optionsByCategory,
        ),
        templateId,
      },
      {
        onSuccess: () => {
          resetDraft();
          router.replace(getSellerBackHref("orderForm"));
        },
      },
    );
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader backHref={getSellerBackHref("orderForm")} />
      <section className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pt-6 pb-4">
        <div className="space-y-2">
          <h2 className="text-seller-display-lg font-bold tracking-[-0.84px] whitespace-pre-line">
            {`‘${storeName}’의\n주문서를 작성해주세요`}
          </h2>
          <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
            손님이 주문할 때 채우는 주문서 양식을 만들어보세요
          </p>
        </div>
        <div className="space-y-2">
          {orderFormCategories.map((category) => (
            <SettingRow
              completed={(optionsByCategory[category.slug]?.length ?? 0) > 0}
              href={`/seller/order-form/${category.slug}`}
              key={category.slug}
              label={category.label}
            />
          ))}
        </div>
      </section>
      <div className="flex flex-col gap-2 px-4 pt-4 pb-[34px]">
        {saveMutation.error ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {saveMutation.error instanceof Error
              ? saveMutation.error.message
              : "주문서 양식을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
            onClick={() => router.push("/seller/order-form/preview")}
            size="md"
            variant="outline"
          >
            미리보기
          </Button>
          <Button
            className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
            disabled={
              !isComplete || !statusQuery.data || saveMutation.isPending
            }
            onClick={saveOrderForm}
            size="md"
          >
            {saveMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </main>
  );
}
