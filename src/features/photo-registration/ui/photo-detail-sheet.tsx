import { X } from "lucide-react";

import { BottomSheet } from "@/components/common/bottom-sheet";
import { Button } from "@/components/common/button";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/assets/model/image-upload";

type PhotoDetailSheetProps = {
  alt: string;
  isSubmitting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onReplace: (file: File) => void;
  open: boolean;
  src: string;
};

export function PhotoDetailSheet({
  alt,
  isSubmitting,
  onClose,
  onDelete,
  onReplace,
  open,
  src,
}: PhotoDetailSheetProps) {
  return (
    <BottomSheet
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      open={open}
    >
      <section className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            aria-label="사진 상세 보기 닫기"
            className="-my-2 -mr-2 flex size-12 items-center justify-center"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-6 text-text-secondary" />
          </button>
        </div>
        <div className="aspect-square overflow-hidden rounded-seller-sm shadow-[0_1px_3px_0_rgb(0_0_0_/_0.06),0_1px_2px_0_rgb(0_0_0_/_0.04)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={alt} className="size-full object-cover" src={src} />
        </div>
        <div className="flex gap-2">
          <Button
            className="h-11 min-w-px flex-[1_0_0] rounded-seller-md px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px]"
            disabled={isSubmitting}
            onClick={onDelete}
            size="md"
            variant="destructive"
          >
            삭제하기
          </Button>
          <label className="flex h-11 min-w-px flex-[1_0_0] cursor-pointer items-center justify-center rounded-seller-md border border-border-default px-6 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary has-disabled:cursor-not-allowed has-disabled:opacity-40">
            <input
              accept={IMAGE_UPLOAD_ACCEPT}
              className="sr-only"
              disabled={isSubmitting}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";

                if (file) onReplace(file);
              }}
              type="file"
            />
            교체하기
          </label>
        </div>
      </section>
    </BottomSheet>
  );
}
