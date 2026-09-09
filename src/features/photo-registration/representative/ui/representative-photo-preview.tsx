type RepresentativePhotoPreviewProps = {
  isProcessing: boolean;
  onClick?: () => void;
  src?: string;
};

export function RepresentativePhotoPreview({
  isProcessing,
  onClick,
  src,
}: RepresentativePhotoPreviewProps) {
  return (
    <button
      aria-label="대표사진 상세 보기"
      className="relative aspect-square min-w-0 overflow-hidden rounded-seller-sm bg-surface-subtle shadow-[0_1px_3px_0_rgb(0_0_0_/_0.06),0_1px_2px_0_rgb(0_0_0_/_0.04)] disabled:cursor-default"
      disabled={!onClick}
      onClick={onClick}
      type="button"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="등록한 대표사진 미리보기"
          className="size-full object-cover"
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
