import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toneClassNames = {
  neutral: "bg-seller-secondary text-seller-muted",
  info: "bg-seller-blue text-blue-700",
  warning: "bg-seller-yellow text-amber-800",
  success: "bg-seller-green text-emerald-800",
  accent: "bg-seller-pink text-pink-700",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof toneClassNames;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium",
        toneClassNames[tone],
        className,
      )}
      {...props}
    />
  );
}
