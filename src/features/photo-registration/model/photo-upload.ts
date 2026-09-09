const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

const supportedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const PHOTO_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";

export function getPhotoUploadError(file: File) {
  if (!supportedPhotoTypes.has(file.type)) {
    return "JPG, PNG, WEBP 형식의 사진만 등록할 수 있어요.";
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "사진은 10MB 이하로 등록해 주세요.";
  }

  return null;
}
