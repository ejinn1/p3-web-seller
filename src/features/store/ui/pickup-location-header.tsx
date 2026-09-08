import { Header } from "@/components/common/header";

type PickupLocationHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function PickupLocationHeader({
  onBack,
  title = "픽업 장소",
}: PickupLocationHeaderProps) {
  return (
    <Header
      backLabel="이전 화면으로 돌아가기"
      className="border-border-subtle"
      onBack={onBack}
      title={title}
      titleClassName="text-seller-heading-md font-semibold tracking-[-0.54px]"
    />
  );
}
