import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error = false, children, ...props }, ref) => (
    <span className="relative block">
      <select
        aria-invalid={error || undefined}
        className={cn(
          "h-11 w-full appearance-none rounded-seller-control border bg-surface-default px-3 pr-10 text-seller-body outline-none focus:border-seller-primary focus:ring-2 focus:ring-seller-primary/10 disabled:cursor-not-allowed disabled:bg-seller-secondary",
          error ? "border-seller-danger" : "border-seller-border",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-seller-muted"
      />
    </span>
  ),
);

Select.displayName = "Select";
