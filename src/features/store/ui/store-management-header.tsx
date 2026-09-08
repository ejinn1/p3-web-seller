import { SellerMenuHeader } from "@/components/widgets/seller-menu-header";

export function StoreManagementHeader() {
  return (
    <SellerMenuHeader
      backHref="/seller"
      backLabel="판매자 홈으로 돌아가기"
      className="border-none"
      title="스토어 관리"
    />
  );
}
