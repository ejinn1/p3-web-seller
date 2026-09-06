import { InquiryDetailScreen } from "@/features/inquiries/ui/inquiry-detail-screen";

export default async function SellerInquiryDetailPage({
  params,
}: {
  params: Promise<{ inquiryId: string }>;
}) {
  const { inquiryId } = await params;

  return <InquiryDetailScreen inquiryId={inquiryId} />;
}
