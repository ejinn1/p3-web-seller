import { RevenueScreen } from "@/features/revenue/ui/revenue-screen";
import type { RevenueView } from "@/features/revenue/model/revenue-types";

type RevenuePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const revenueViews = new Set<RevenueView>([
  "home",
  "payments",
  "discounts",
  "cancellations",
  "cancel-history",
]);

export default async function RevenuePage({ searchParams }: RevenuePageProps) {
  const params = await searchParams;
  const rawView = Array.isArray(params?.view) ? params?.view[0] : params?.view;
  const initialView =
    rawView && revenueViews.has(rawView as RevenueView)
      ? (rawView as RevenueView)
      : "home";

  return <RevenueScreen initialView={initialView} />;
}
