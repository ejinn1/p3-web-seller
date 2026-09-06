import { Suspense } from "react";
import { SellerOrderCalendarScreen } from "@/features/orders/ui/seller-order-calendar-screen";

export default function SellerOrderCalendarPage() {
  return (
    <Suspense fallback={null}>
      <SellerOrderCalendarScreen />
    </Suspense>
  );
}
