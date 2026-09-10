"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/common/button";
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

const emptyItems: string[] = [];

export function NoticeCategoryScreen({ category }: NoticeCategoryScreenProps) {
  const router = useRouter();
  const items = useNoticeDraftStore(
    (state) => state.itemsByType[category.type] ?? emptyItems,
  );
  const addItem = useNoticeDraftStore((state) => state.addItem);
  const ensureInitialItem = useNoticeDraftStore(
    (state) => state.ensureInitialItem,
  );
  const removeItem = useNoticeDraftStore((state) => state.removeItem);
  const updateItem = useNoticeDraftStore((state) => state.updateItem);
  const currentCategoryIndex = noticeCategories.findIndex(
    (item) => item.type === category.type,
  );
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-subtle text-text-primary">
      <div className="bg-surface-default">
        <OrderFormHeader
          backHref={getSellerBackHref("noticeCategory")}

          title={category.label}
        />
      </div>
      <section className="flex flex-1 overflow-y-auto p-4">
        <div className="flex h-fit w-full flex-col gap-6 rounded-seller-md bg-surface-default p-4">
          <div className="flex flex-col gap-4">
            <p className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-tertiary">
              {category.label}
            </p>
            <div className="flex flex-col gap-1">
              {items.map((item, index) => (
                <NoticeItemInput
                  key={`${category.type}-${index}`}
                  onChange={(content) =>
                    updateItem(category.type, index, content)
                  }
                  onDelete={() => removeItem(category.type, index)}
                  value={item}
                />
              ))}
            </div>
          </div>
          <Button
            className="h-11 w-fit gap-0 overflow-hidden rounded-seller-md py-0 pr-4 pl-0 text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            disabled={isItemLimitReached}
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
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={() => router.push("/seller/notice")}
          size="md"
          variant="outline"
        >
          확인
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
      </div>
    </main>
  );
}
