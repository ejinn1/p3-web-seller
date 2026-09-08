"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/button";
import { useNoticeDraftStore } from "@/features/notice/model/notice-draft";
import { useNoticesQuery } from "@/features/notice/model/notice-queries";

type NoticeInitializerProps = {
  children: React.ReactNode;
};

export function NoticeInitializer({ children }: NoticeInitializerProps) {
  const noticesQuery = useNoticesQuery();
  const isInitialized = useNoticeDraftStore((state) => state.isInitialized);
  const replaceDraft = useNoticeDraftStore((state) => state.replaceDraft);
  const setInitialized = useNoticeDraftStore((state) => state.setInitialized);

  useEffect(() => {
    if (isInitialized || !noticesQuery.isSuccess) return;

    replaceDraft(noticesQuery.data);
    setInitialized();
  }, [
    isInitialized,
    noticesQuery.data,
    noticesQuery.isSuccess,
    replaceDraft,
    setInitialized,
  ]);

  if (noticesQuery.isError) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col items-center justify-center gap-4 bg-surface-default px-4 text-center text-text-primary">
        <p className="text-seller-body-md text-text-secondary">
          {noticesQuery.error instanceof Error
            ? noticesQuery.error.message
            : "공지사항을 불러오지 못했습니다."}
        </p>
        <Button onClick={() => noticesQuery.refetch()} size="md">
          다시 시도
        </Button>
      </main>
    );
  }

  if (!isInitialized) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[768px] items-center justify-center bg-surface-default px-4 text-text-secondary">
        <p className="text-seller-body-md">공지사항을 불러오고 있어요.</p>
      </main>
    );
  }

  return children;
}
