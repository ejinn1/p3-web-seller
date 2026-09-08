"use client";

import { noticeCategories } from "@/features/notice/model/notice-categories";
import { useNoticeDraftStore } from "@/features/notice/model/notice-draft";
import { NoticePreviewSection } from "@/features/notice/ui/notice-preview-section";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";

export function NoticePreviewScreen() {
  const itemsByType = useNoticeDraftStore((state) => state.itemsByType);
  const previewCategories = noticeCategories.map((category) => ({
    ...category,
    items: (itemsByType[category.type] ?? []).filter((item) => item.trim()),
  }));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-subtle text-text-primary">
      <div className="bg-surface-default">
        <OrderFormHeader
          backHref="/seller/notice"
          backLabel="공지사항으로 돌아가기"
          showMenu={false}
          title="미리보기"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {previewCategories.map((category) => (
          <NoticePreviewSection
            items={category.items}
            key={category.type}
            title={category.label}
          />
        ))}
      </div>
    </main>
  );
}
