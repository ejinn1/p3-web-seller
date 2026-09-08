"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/button";
import {
  orderFormCategories,
  type OrderFormCategorySlug,
} from "@/features/order-form/model/order-form-categories";
import { useOrderFormDraftStore } from "@/features/order-form/model/order-form-draft";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { OrderFormConfiguredOptionCard } from "@/features/order-form/ui/order-form-configured-option-card";
import { OrderFormOptionCard } from "@/features/order-form/ui/order-form-option-card";
import { OrderFormOptionSheet } from "@/features/order-form/ui/order-form-option-sheet";

type OrderFormCategoryScreenProps = {
  category: OrderFormCategorySlug;
  title: string;
};

const emptyOptions = [] as const;

export function OrderFormCategoryScreen({
  category,
  title,
}: OrderFormCategoryScreenProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sheetSession, setSheetSession] = useState(0);
  const options = useOrderFormDraftStore(
    (state) => state.optionsByCategory[category] ?? emptyOptions,
  );
  const addOption = useOrderFormDraftStore((state) => state.addOption);
  const removeOption = useOrderFormDraftStore((state) => state.removeOption);
  const updateOption = useOrderFormDraftStore((state) => state.updateOption);
  const isOptionLimitReached = options.length === 6;
  const currentCategoryIndex = orderFormCategories.findIndex(
    (item) => item.slug === category,
  );
  const nextCategory = orderFormCategories[currentCategoryIndex + 1];

  const moveToNextStep = () => {
    router.push(
      nextCategory
        ? `/seller/order-form/${nextCategory.slug}`
        : "/seller/order-form",
    );
  };

  const openAddSheet = () => {
    setEditingIndex(null);
    setSheetSession((session) => session + 1);
    setIsSheetOpen(true);
  };

  const openEditSheet = (index: number) => {
    setEditingIndex(index);
    setSheetSession((session) => session + 1);
    setIsSheetOpen(true);
  };

  const completeOption = (option: (typeof options)[number]) => {
    if (editingIndex === null) {
      addOption(category, option);
    } else {
      updateOption(category, editingIndex, option);
      setSelectedIndex(null);
    }
  };

  const deleteOption = (index: number) => {
    removeOption(category, index);
    setSelectedIndex(null);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-subtle text-text-primary">
      <div className="bg-surface-default">
        <OrderFormHeader
          backHref="/seller/order-form"
          showMenu={false}
          title={title}
        />
      </div>
      <section className="flex flex-1 flex-col gap-4 p-4">
        {options.map((option, index) => (
          <div className="flex flex-col gap-2" key={`${option.type}-${index}`}>
            <OrderFormConfiguredOptionCard
              {...option}
              index={index + 1}
              onSelect={() =>
                setSelectedIndex((currentIndex) =>
                  currentIndex === index ? null : index,
                )
              }
              selected={selectedIndex === index}
            />
            {selectedIndex === index ? (
              <div className="flex gap-2">
                <Button
                  className="h-9 flex-1 rounded-seller-lg text-[15px] leading-5 font-semibold tracking-[-0.3px]"
                  onClick={() => deleteOption(index)}
                  size="md"
                  variant="outline"
                >
                  옵션삭제
                </Button>
                <Button
                  className="h-9 flex-1 rounded-seller-md text-[15px] leading-5 font-semibold tracking-[-0.3px]"
                  onClick={() => openEditSheet(index)}
                  size="md"
                >
                  옵션수정
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {isOptionLimitReached ? (
          <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-unavailable">
            최대 6개까지 추가할 수 있어요
          </p>
        ) : (
          <div className="flex flex-col gap-4 rounded-seller-md bg-surface-default p-4">
            <OrderFormOptionCard index={options.length + 1} />
            <Button
              className="h-11 w-fit shrink-0 gap-0 overflow-hidden rounded-seller-sm py-0 pr-4 pl-0 text-[15px] leading-5 font-semibold tracking-[-0.3px]"
              onClick={openAddSheet}
              size="md"
            >
              <span className="flex size-11 items-center justify-center">
                <Plus aria-hidden="true" className="size-6" strokeWidth={2} />
              </span>
              옵션 추가
            </Button>
          </div>
        )}
      </section>
      <div className="flex gap-2 px-4 pt-4 pb-[34px]">
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={() => router.push("/seller/order-form")}
          size="md"
          variant="outline"
        >
          확인
        </Button>
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={moveToNextStep}
          size="md"
        >
          다음
        </Button>
      </div>
      <OrderFormOptionSheet
        initialOption={
          editingIndex === null ? undefined : options[editingIndex]
        }
        key={sheetSession}
        onComplete={completeOption}
        onOpenChange={setIsSheetOpen}
        open={isSheetOpen && (editingIndex !== null || !isOptionLimitReached)}
      />
    </main>
  );
}
