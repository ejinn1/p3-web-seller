import { PhotoDetailSheet } from "@/features/photo-registration/ui/photo-detail-sheet";

type GalleryPhotoDetailSheetProps = {
  isSubmitting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onReplace: (file: File) => void;
  open: boolean;
  src: string;
};

export function GalleryPhotoDetailSheet({
  isSubmitting,
  onClose,
  onDelete,
  onReplace,
  open,
  src,
}: GalleryPhotoDetailSheetProps) {
  return (
    <PhotoDetailSheet
      alt="선택한 갤러리 사진 상세 보기"
      isSubmitting={isSubmitting}
      onClose={onClose}
      onDelete={onDelete}
      onReplace={onReplace}
      open={open}
      src={src}
    />
  );
}
