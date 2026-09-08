import { Header } from "@/components/common/header";

export function StoreManagementHeader() {
  return (
    <Header
      backHref="/seller"
      backLabel="판매자 홈으로 돌아가기"
      className="border-none"
      showMenu
      title="스토어 관리"
    />
  );
}
