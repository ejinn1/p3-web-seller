import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-seller-card border border-seller-border bg-surface-default p-4",
        className,
      )}
      {...props}
    />
  );
}
