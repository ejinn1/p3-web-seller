import { Suspense } from "react";
import { SellerHomeScreen } from "@/features/seller-home/ui/seller-home-screen";

export default function SellerHomePage() {
  return (
    <Suspense>
      <SellerHomeScreen />
    </Suspense>
  );
}
