import { type ReactNode } from "react";
import { Card } from "@/components/common/card";
import { cn } from "@/lib/utils";

type NoticeCardProps = {
  children?: ReactNode;
  className?: string;
  date?: string;
  title: string;
};

export function NoticeCard({
  children,
  className,
  date,
  title,
}: NoticeCardProps) {
  return (
    <Card className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-seller-body font-semibold">{title}</h2>
        {date ? (
          <time className="shrink-0 text-xs text-seller-muted">{date}</time>
        ) : null}
      </div>
      {children ? (
        <div className="text-sm leading-5 text-seller-muted">{children}</div>
      ) : null}
    </Card>
  );
}
