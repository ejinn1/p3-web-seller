"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/button";
import { SelectionCheckbox } from "@/components/common/selection-checkbox";
import {
  orderFormCategories,
  type OrderFormCategorySlug,
} from "@/features/order-form/model/order-form-categories";
import { useOrderFormDraftStore } from "@/features/order-form/model/order-form-draft";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { OrderFormConfiguredOptionCard } from "@/features/order-form/ui/order-form-configured-option-card";
import { OrderFormOptionCard } from "@/features/order-form/ui/order-form-option-card";
import { OrderFormOptionSheet } from "@/features/order-form/ui/order-form-option-sheet";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

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
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [sheetSession, setSheetSession] = useState(0);
  const options = useOrderFormDraftStore(
    (state) => state.optionsByCategory[category] ?? emptyOptions,
  );
  const addOption = useOrderFormDraftStore((state) => state.addOption);
  const removeOptions = useOrderFormDraftStore((state) => state.removeOptions);
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
    setEditingOptionId(null);
    setSheetSession((session) => session + 1);
    setIsSheetOpen(true);
  };

  const openEditSheet = (optionId: string) => {
    setEditingOptionId(optionId);
    setSheetSession((session) => session + 1);
    setIsSheetOpen(true);
  };

  const completeOption = (option: (typeof options)[number]) => {
    if (editingOptionId === null) {
      addOption(category, option);
    } else {
      updateOption(category, editingOptionId, option);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode((currentMode) => !currentMode);
    setSelectedOptionIds(new Set());
  };

  const toggleSelectedOption = (optionId: string) => {
    setSelectedOptionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(optionId)) nextIds.delete(optionId);
      else nextIds.add(optionId);
      return nextIds;
    });
  };

  const deleteSelectedOptions = () => {
    if (selectedOptionIds.size === 0) return;
    removeOptions(category, selectedOptionIds);
    setSelectedOptionIds(new Set());
    setIsDeleteMode(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-subtle text-text-primary">
      <div className="sticky top-0 z-10 bg-surface-default">
        <OrderFormHeader
          backHref={getSellerBackHref("orderFormCategory")}

          title={title}
        />
      </div>
      <section className="flex flex-1 flex-col gap-4 p-4">
        {options.length > 0 ? (
          <div className="flex h-4 items-center justify-end">
            <button
              className="flex size-10 items-center justify-center text-[11px] leading-4 font-medium tracking-[-0.11px]"
              onClick={toggleDeleteMode}
              type="button"
            >
              {isDeleteMode ? "선택취소" : "선택삭제"}
            </button>
          </div>
        ) : null}
        {options.map((option, index) => (
          <div className="flex items-center" key={option.id}>
            {isDeleteMode ? (
              <SelectionCheckbox
                ariaLabel={`옵션 ${index + 1} 삭제 선택`}
                checked={selectedOptionIds.has(option.id)}
                className="-ml-3"
                onChange={() => toggleSelectedOption(option.id)}
              />
            ) : null}
            <OrderFormConfiguredOptionCard
              {...option}
              className="min-w-0 flex-1"
              index={index + 1}
              onClick={() =>
                isDeleteMode
                  ? toggleSelectedOption(option.id)
                  : openEditSheet(option.id)
              }
            />
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
        {isDeleteMode ? (
          <Button
            className="h-[52px] w-full rounded-seller-md text-seller-heading-md font-semibold"
            disabled={selectedOptionIds.size === 0}
            onClick={deleteSelectedOptions}
            size="md"
          >
            삭제하기
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>
      <OrderFormOptionSheet
        initialOption={
          editingOptionId === null
            ? undefined
            : options.find((option) => option.id === editingOptionId)
        }
        key={sheetSession}
        onComplete={completeOption}
        onOpenChange={setIsSheetOpen}
        open={
          isSheetOpen && (editingOptionId !== null || !isOptionLimitReached)
        }
      />
    </main>
  );
}
