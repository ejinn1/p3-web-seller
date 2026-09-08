import { SellerMenuHeader } from "@/components/widgets/seller-menu-header";

type StoreManagementHeaderProps = {
  backHref: string;
};

export function StoreManagementHeader({
  backHref,
}: StoreManagementHeaderProps) {
  return (
    <SellerMenuHeader
      backHref={backHref}
      backLabel="이전 화면으로 돌아가기"
      className="border-none"
      title="스토어 관리"
    />
  );
}
