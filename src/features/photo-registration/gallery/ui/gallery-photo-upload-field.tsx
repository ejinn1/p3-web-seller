import Image from "next/image";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/assets/model/image-upload";

type GalleryPhotoUploadFieldProps = {
  disabled?: boolean;
  onFileSelect: (file: File) => void;
};

export function GalleryPhotoUploadField({
  disabled = false,
  onFileSelect,
}: GalleryPhotoUploadFieldProps) {
  return (
    <label
      aria-label="갤러리 사진 업로드 영역"
      className="flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-seller-sm bg-surface-subtle has-disabled:cursor-not-allowed has-disabled:opacity-40"
    >
      <input
        accept={IMAGE_UPLOAD_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (file) {
            onFileSelect(file);
          }
        }}
        type="file"
      />
      <Image
        aria-hidden="true"
        alt=""
        className="size-5"
        height={16}
        src="/photo-registration/upload.svg"
        width={16}
      />
    </label>
  );
}
