import { AccountSettingsScreen } from "@/features/account-settings/ui/account-settings-screen";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";

export default function SellerAccountSettingsPage() {
  return (
    <SellerAuthGuard>
      <AccountSettingsScreen />
    </SellerAuthGuard>
  );
}
