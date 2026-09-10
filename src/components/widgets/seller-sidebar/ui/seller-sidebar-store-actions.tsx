"use client";

import { useState } from "react";
import { Button } from "@/components/common/button";
import { shareStoreLink } from "@/features/store/model/store-share";

type SellerSidebarStoreActionsProps = {
  enabled: boolean;
  isLoading: boolean;
  storeName: string;
  url?: string;
};

export function SellerSidebarStoreActions({
  enabled,
  isLoading,
  storeName,
  url,
}: SellerSidebarStoreActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const canUseStoreLink = enabled && Boolean(url) && !isLoading;

  const handleShare = async () => {
    if (!url) {
      return;
    }

    setFeedback(null);

    try {
      const result = await shareStoreLink({ storeName, url });

      if (result === "copied") {
        setFeedback("스토어 링크를 복사했어요.");
      } else if (result === "shared") {
        setFeedback("스토어 링크를 공유했어요.");
      }
    } catch {
      setFeedback("스토어 링크를 공유하지 못했습니다. 다시 시도해 주세요.");
    }
  };

  const handleOpenStore = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="shrink-0 space-y-2 px-6">
      {feedback ? (
        <p
          aria-live="polite"
          className="pb-1 text-center text-[12px] leading-4 text-text-secondary"
        >
          {feedback}
        </p>
      ) : null}
      <Button
        disabled={!canUseStoreLink}
        fullWidth
        onClick={() => void handleShare()}
        size="lg"
        variant="outline"
      >
        스토어 공유
      </Button>
      <Button
        disabled={!canUseStoreLink}
        fullWidth
        onClick={handleOpenStore}
        size="lg"
      >
        내 스토어 보기
      </Button>
    </div>
  );
}
