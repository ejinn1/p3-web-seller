import { CircleAlert } from "lucide-react";
import { type ReactNode } from "react";
import { Card } from "@/components/common/card";
import { cn } from "@/lib/utils";

type NoticeBoxProps = {
  children: ReactNode;
  className?: string;
  title: string;
  tone?: "default" | "warning";
};

export function NoticeBox({
  children,
  className,
  title,
  tone = "default",
}: NoticeBoxProps) {
  return (
    <Card
      className={cn(
        "flex gap-3 p-4",
        tone === "warning" && "border-amber-200 bg-amber-50",
        className,
      )}
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-seller-muted"
      />
      <div className="space-y-1">
        <h2 className="text-seller-body font-semibold">{title}</h2>
        <div className="text-sm leading-5 text-seller-muted">{children}</div>
      </div>
    </Card>
  );
}
