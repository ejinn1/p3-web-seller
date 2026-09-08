import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

const textSizeClassPattern =
  /(?:^|\s)!?text-(?:\[[^\]]+\]|(?:xs|sm|base|lg|xl|[2-9]xl)|seller-(?:display|heading|body|title|label)(?:-[a-z]+)?)(?=\s|$)/;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    const hasTextSizeClass = textSizeClassPattern.test(className ?? "");

    return (
      <input
        aria-invalid={error || undefined}
        className={cn(
          "h-11 w-full rounded-seller-control border bg-surface-default px-3 outline-none placeholder:text-seller-muted focus:border-seller-primary focus:ring-2 focus:ring-seller-primary/10 disabled:cursor-not-allowed disabled:bg-seller-secondary",
          !hasTextSizeClass && "text-seller-body",
          error ? "border-seller-danger" : "border-seller-border",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
