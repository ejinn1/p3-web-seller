import { Suspense } from "react";
import { SellerAuthGuard } from "@/features/auth/ui/seller-auth-guard";
import { SellerOrderDetailScreen } from "@/features/orders/ui/seller-order-detail-screen";

type SellerOrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function SellerOrderDetailPage({
  params,
}: SellerOrderDetailPageProps) {
  const { orderId } = await params;

  return (
    <SellerAuthGuard>
      <Suspense fallback={null}>
        <SellerOrderDetailScreen orderId={orderId} />
      </Suspense>
    </SellerAuthGuard>
  );
}
