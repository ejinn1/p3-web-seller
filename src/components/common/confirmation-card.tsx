import { CircleCheck } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";

type ConfirmationCardProps = {
  actionLabel?: string;
  children?: ReactNode;
  onAction?: () => void;
  title: string;
};

export function ConfirmationCard({
  actionLabel,
  children,
  onAction,
  title,
}: ConfirmationCardProps) {
  return (
    <Card className="space-y-4 text-center">
      <CircleCheck
        aria-hidden="true"
        className="mx-auto size-10 text-emerald-600"
      />
      <div className="space-y-1">
        <h2 className="text-seller-title font-semibold">{title}</h2>
        {children ? (
          <div className="text-sm text-seller-muted">{children}</div>
        ) : null}
      </div>
      {actionLabel ? (
        <Button fullWidth onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
