import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { SellerHomeScreen } from "@/features/seller-home/ui/seller-home-screen";

export default function SellerHomePage() {
  return (
    <SellerAuthGuard>
      <Suspense>
        <SellerHomeScreen />
      </Suspense>
    </SellerAuthGuard>
  );
}
