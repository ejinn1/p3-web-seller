import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { SellerOrdersScreen } from "@/features/orders/ui/seller-orders-screen";

export default function SellerOrdersPage() {
  return (
    <SellerAuthGuard>
      <Suspense fallback={null}>
        <SellerOrdersScreen />
      </Suspense>
    </SellerAuthGuard>
  );
}
