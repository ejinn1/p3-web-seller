import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChatRowProps = {
  children: ReactNode;
  className?: string;
  sentAt?: string;
  variant?: "incoming" | "outgoing" | "system";
};

export function ChatRow({
  children,
  className,
  sentAt,
  variant = "incoming",
}: ChatRowProps) {
  const isOutgoing = variant === "outgoing";

  if (variant === "system") {
    return (
      <p
        className={cn("py-2 text-center text-xs text-seller-muted", className)}
      >
        {children}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOutgoing && "justify-end",
        className,
      )}
    >
      {isOutgoing && sentAt ? (
        <time className="text-xs text-seller-muted">{sentAt}</time>
      ) : null}
      <div
        className={cn(
          "max-w-[78%] rounded-seller-card px-3 py-2 text-sm leading-5",
          isOutgoing
            ? "text-text-inverse bg-seller-primary"
            : "bg-seller-secondary text-seller-primary",
        )}
      >
        {children}
      </div>
      {!isOutgoing && sentAt ? (
        <time className="text-xs text-seller-muted">{sentAt}</time>
      ) : null}
    </div>
  );
}
