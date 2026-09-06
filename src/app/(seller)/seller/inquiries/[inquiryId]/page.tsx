import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { InquiryDetailScreen } from "@/features/inquiries/ui/inquiry-detail-screen";

export default async function SellerInquiryDetailPage({
  params,
}: {
  params: Promise<{ inquiryId: string }>;
}) {
  const { inquiryId } = await params;

  return (
    <SellerAuthGuard>
      <Suspense fallback={null}>
        <InquiryDetailScreen inquiryId={inquiryId} />
      </Suspense>
    </SellerAuthGuard>
  );
}
