import { type ReactNode } from "react";
import { Card } from "@/components/common/card";

type PaymentSummaryProps = {
  items: Array<{ label: string; value: ReactNode }>;
  totalLabel?: string;
  totalValue: ReactNode;
};

export function PaymentSummary({
  items,
  totalLabel = "최종 가격",
  totalValue,
}: PaymentSummaryProps) {
  return (
    <Card className="space-y-3">
      <dl className="space-y-2 text-sm">
        {items.map((item) => (
          <div
            className="flex justify-between gap-4 text-seller-muted"
            key={item.label}
          >
            <dt>{item.label}</dt>
            <dd className="text-right text-seller-primary">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-between border-t border-seller-border pt-3 text-seller-title font-semibold">
        <span>{totalLabel}</span>
        <span>{totalValue}</span>
      </div>
    </Card>
  );
}
