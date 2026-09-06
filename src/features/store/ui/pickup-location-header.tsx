import { ChevronLeft } from "lucide-react";

type PickupLocationHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function PickupLocationHeader({
  onBack,
  title = "픽업 장소",
}: PickupLocationHeaderProps) {
  return (
    <header className="grid h-14 grid-cols-[48px_1fr_48px] items-center border-b border-border-subtle bg-surface-default">
      <button
        aria-label="이전 화면으로 돌아가기"
        className="flex h-full items-center justify-center"
        onClick={onBack}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.8} />
      </button>
      <h1 className="text-center text-seller-heading-md font-semibold tracking-[-0.54px]">
        {title}
      </h1>
    </header>
  );
}
