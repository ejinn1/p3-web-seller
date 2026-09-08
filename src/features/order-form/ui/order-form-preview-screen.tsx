"use client";

import { orderFormCategories } from "@/features/order-form/model/order-form-categories";
import { useOrderFormDraftStore } from "@/features/order-form/model/order-form-draft";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { OrderFormPreviewCategory } from "@/features/order-form/ui/order-form-preview-category";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function OrderFormPreviewScreen() {
  const optionsByCategory = useOrderFormDraftStore(
    (state) => state.optionsByCategory,
  );
  const configuredCategories = orderFormCategories.filter(
    (category) => (optionsByCategory[category.slug]?.length ?? 0) > 0,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[768px] bg-surface-subtle text-text-primary">
      <div className="bg-surface-default">
        <OrderFormHeader
          backHref={getSellerBackHref("orderFormPreview")}
          backLabel="주문서 양식으로 돌아가기"

          title="미리보기"
        />
      </div>
      <section className="px-4 pt-4 pb-[34px]">
        {configuredCategories.length > 0 ? (
          <div className="flex flex-col gap-12 rounded-seller-sm bg-surface-default px-4 py-6 shadow-[0_1px_1.5px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)]">
            {configuredCategories.map((category) => (
              <OrderFormPreviewCategory
                groupName={`preview-${category.slug}`}
                key={category.slug}
                options={optionsByCategory[category.slug] ?? []}
                required={category.required}
                title={category.label}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-seller-sm bg-surface-default px-4 py-12 text-center shadow-[0_1px_1.5px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)]">
            <h2 className="text-seller-heading-lg font-bold tracking-[-0.6px]">
              미리볼 옵션이 없어요
            </h2>
            <p className="mt-2 text-seller-body-md tracking-[-0.32px] text-text-secondary">
              주문서 양식에서 옵션을 먼저 추가해주세요
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
