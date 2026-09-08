import { Header } from "@/components/common/header";

type OrderFormHeaderProps = {
  backLabel?: string;
  backHref: string;
  showMenu?: boolean;
  title?: string;
};

export function OrderFormHeader({
  backLabel = "스토어 관리로 돌아가기",
  backHref,
  showMenu = true,
  title,
}: OrderFormHeaderProps) {
  return (
    <Header
      backHref={backHref}
      backLabel={backLabel}
      className="border-none"
      showMenu={showMenu}
      title={title}
    />
  );
}
