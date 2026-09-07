import { ChevronRight } from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NotificationRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  description?: string;
  icon?: ReactNode;
  title: string;
};

export function NotificationRow({
  className,
  description,
  icon,
  title,
  type = "button",
  ...props
}: NotificationRowProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 border-b border-seller-border bg-surface-default px-4 py-3 text-left hover:bg-seller-surface",
        className,
      )}
      type={type}
      {...props}
    >
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-seller-secondary">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {description ? (
          <span className="mt-0.5 block truncate text-xs text-seller-muted">
            {description}
          </span>
        ) : null}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-seller-muted"
      />
    </button>
  );
}
