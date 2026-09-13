"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/button";
import { SelectionCheckbox } from "@/components/common/selection-checkbox";
import {
  noticeCategories,
  type NoticeCategory,
} from "@/features/notice/model/notice-categories";
import { useNoticeDraftStore } from "@/features/notice/model/notice-draft";
import { NoticeItemInput } from "@/features/notice/ui/notice-item-input";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

type NoticeCategoryScreenProps = {
  category: NoticeCategory;
};

const emptyItems = [] as const;

export function NoticeCategoryScreen({ category }: NoticeCategoryScreenProps) {
  return <NoticeCategoryEditor category={category} key={category.type} />;
}

function NoticeCategoryEditor({ category }: NoticeCategoryScreenProps) {
  const router = useRouter();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const items = useNoticeDraftStore(
    (state) => state.itemsByType[category.type] ?? emptyItems,
  );
  const addItem = useNoticeDraftStore((state) => state.addItem);
  const ensureInitialItem = useNoticeDraftStore(
    (state) => state.ensureInitialItem,
  );
  const removeItems = useNoticeDraftStore((state) => state.removeItems);
  const updateItem = useNoticeDraftStore((state) => state.updateItem);
  const currentCategoryIndex = noticeCategories.findIndex(
    (item) => item.type === category.type,
  );
  const previousCategory = noticeCategories[currentCategoryIndex - 1];
  const nextCategory = noticeCategories[currentCategoryIndex + 1];
  const isItemLimitReached = items.length >= 6;

  useEffect(() => {
    ensureInitialItem(category.type);
  }, [category.type, ensureInitialItem]);

  const addNoticeItem = () => {
    if (isItemLimitReached) {
      return;
    }

    addItem(category.type, "");
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode((currentMode) => !currentMode);
    setSelectedItemIds(new Set());
  };

  const toggleSelectedItem = (itemId: string) => {
    setSelectedItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(itemId)) nextIds.delete(itemId);
      else nextIds.add(itemId);
      return nextIds;
    });
  };

  const deleteSelectedItems = () => {
    if (selectedItemIds.size === 0) return;
    removeItems(category.type, selectedItemIds);
    setSelectedItemIds(new Set());
    setIsDeleteMode(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-subtle text-text-primary">
      <div className="sticky top-0 z-10 bg-surface-default">
        <OrderFormHeader
          backHref={getSellerBackHref("noticeCategory")}

          title={category.label}
        />
      </div>
      <section className="flex flex-1 overflow-y-auto p-4">
        <div className="flex h-fit w-full flex-col gap-6 rounded-seller-md bg-surface-default p-4">
          <div className="flex flex-col gap-4">
            <div className="flex h-4 items-center justify-between">
              <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
                {category.label}
              </p>
              {items.length > 0 ? (
                <button
                  className="flex size-10 items-center justify-center text-[11px] leading-4 font-medium tracking-[-0.11px]"
                  onClick={toggleDeleteMode}
                  type="button"
                >
                  {isDeleteMode ? "선택취소" : "선택삭제"}
                </button>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              {items.map((item, index) => (
                <div className="flex items-start" key={item.id}>
                  {isDeleteMode ? (
                    <SelectionCheckbox
                      ariaLabel={`공지사항 ${index + 1} 삭제 선택`}
                      checked={selectedItemIds.has(item.id)}
                      className="-ml-3"
                      onChange={() => toggleSelectedItem(item.id)}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <NoticeItemInput
                      onChange={(content) =>
                        updateItem(category.type, item.id, content)
                      }
                      readOnly={isDeleteMode}
                      value={item.content}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="h-11 w-fit gap-0 overflow-hidden rounded-seller-md py-0 pr-4 pl-0 text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            disabled={isDeleteMode || isItemLimitReached}
            onClick={addNoticeItem}
            size="md"
          >
            <span className="flex size-11 items-center justify-center">
              <Plus aria-hidden="true" className="size-6" strokeWidth={2} />
            </span>
            옵션 추가
          </Button>
          {isItemLimitReached ? (
            <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-disabled">
              최대 6개까지 추가할 수 있어요
            </p>
          ) : null}
        </div>
      </section>
      <div className="flex gap-2 px-4 pt-4 pb-[34px]">
        {isDeleteMode ? (
          <Button
            className="h-[52px] w-full rounded-seller-md text-seller-heading-md font-semibold"
            disabled={selectedItemIds.size === 0}
            onClick={deleteSelectedItems}
            size="md"
          >
            삭제하기
          </Button>
        ) : (
          <>
            <Button
              className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
              onClick={() =>
                router.push(
                  previousCategory
                    ? `/seller/notice/${previousCategory.slug}`
                    : "/seller/notice",
                )
              }
              size="md"
              variant="outline"
            >
              이전
            </Button>
            <Button
              className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
              onClick={() =>
                router.push(
                  nextCategory
                    ? `/seller/notice/${nextCategory.slug}`
                    : "/seller/notice",
                )
              }
              size="md"
            >
              다음
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
