"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/button";
import { useOrderFormDraftStore } from "@/features/order-form/model/order-form-draft";
import { useActiveOrderFormQuery } from "@/features/order-form/model/order-form-queries";

type OrderFormInitializerProps = {
  children: React.ReactNode;
};

export function OrderFormInitializer({ children }: OrderFormInitializerProps) {
  const activeOrderFormQuery = useActiveOrderFormQuery();
  const replaceDraft = useOrderFormDraftStore((state) => state.replaceDraft);
  const initialized = useRef(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    if (initialized.current || !activeOrderFormQuery.isSuccess) return;

    replaceDraft(
      activeOrderFormQuery.data.templateId,
      activeOrderFormQuery.data.optionsByCategory,
    );
    initialized.current = true;
    setDraftReady(true);
  }, [activeOrderFormQuery.data, activeOrderFormQuery.isSuccess, replaceDraft]);

  if (activeOrderFormQuery.isError) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-surface-default px-4 text-center text-text-primary">
        <p className="text-seller-body-md text-text-secondary">
          {activeOrderFormQuery.error instanceof Error
            ? activeOrderFormQuery.error.message
            : "주문서 양식을 불러오지 못했습니다."}
        </p>
        <Button onClick={() => activeOrderFormQuery.refetch()} size="md">
          다시 시도
        </Button>
      </main>
    );
  }

  if (!draftReady) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[390px] items-center justify-center bg-surface-default px-4 text-text-secondary">
        <p className="text-seller-body-md">주문서 양식을 불러오고 있어요.</p>
      </main>
    );
  }

  return children;
}
