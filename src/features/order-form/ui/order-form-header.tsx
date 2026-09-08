import { SellerMenuHeader } from "@/components/widgets/seller-menu-header";

type OrderFormHeaderProps = {
  backLabel?: string;
  backHref: string;
  title?: string;
};

export function OrderFormHeader({
  backLabel = "스토어 관리로 돌아가기",
  backHref,
  title,
}: OrderFormHeaderProps) {
  return (
    <SellerMenuHeader
      backHref={backHref}
      backLabel={backLabel}
      className="border-none"
      title={title}
    />
  );
}
