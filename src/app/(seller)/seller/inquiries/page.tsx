import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { InquiryListScreen } from "@/features/inquiries/ui/inquiry-list-screen";

export default function SellerInquiriesPage() {
  return (
    <SellerAuthGuard>
      <Suspense fallback={null}>
        <InquiryListScreen />
      </Suspense>
    </SellerAuthGuard>
  );
}
