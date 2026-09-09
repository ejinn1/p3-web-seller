import type { SortableItemProps } from "@/hooks/use-sortable-list";

type GalleryPhotoPreviewProps = {
  isDragging: boolean;
  isProcessing: boolean;
  onClick?: () => void;
  src?: string;
  sortableItemProps: SortableItemProps;
};

export function GalleryPhotoPreview({
  isDragging,
  isProcessing,
  onClick,
  src,
  sortableItemProps,
}: GalleryPhotoPreviewProps) {
  return (
    <button
      aria-label="갤러리 사진 자세히 보기"
      className={`relative aspect-square min-w-0 touch-none overflow-hidden rounded-seller-sm bg-surface-subtle shadow-[0_1px_3px_0_rgb(0_0_0_/_0.06),0_1px_2px_0_rgb(0_0_0_/_0.04)] select-none ${isDragging ? "z-10 scale-95 opacity-70" : ""}`}
      onClick={onClick}
      {...sortableItemProps}
      type="button"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="등록한 갤러리 사진 미리보기"
          className="size-full object-cover"
          draggable={false}
          src={src}
        />
      ) : null}
      {isProcessing ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-text-inverse">
          처리 중
        </span>
      ) : null}
    </button>
  );
}
