import { CalendarDays } from "lucide-react";
import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type DateAreaProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function DateArea({ className, id, label, ...props }: DateAreaProps) {
  const inputId = id ?? `date-${label}`;

  return (
    <div className="space-y-2">
      <label className="text-seller-body font-medium" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          className={cn(
            "h-11 w-full rounded-seller-control border border-seller-border bg-surface-default px-3 pr-10 text-seller-body outline-none focus:border-seller-primary focus:ring-2 focus:ring-seller-primary/10",
            className,
          )}
          id={inputId}
          type="date"
          {...props}
        />
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-seller-muted"
        />
      </div>
    </div>
  );
}
