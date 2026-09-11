import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { SellerSettlementAccountScreen } from "@/features/settlement-account/ui/seller-settlement-account-screen";

export default function SellerSettlementAccountPage() {
  return (
    <SellerAuthGuard>
      <SellerSettlementAccountScreen />
    </SellerAuthGuard>
  );
}
