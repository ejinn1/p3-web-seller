import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { SellerOrderCalendarScreen } from "@/features/orders/ui/seller-order-calendar-screen";

export default function SellerOrderCalendarPage() {
  return (
    <SellerAuthGuard>
      <Suspense fallback={null}>
        <SellerOrderCalendarScreen />
      </Suspense>
    </SellerAuthGuard>
  );
}
