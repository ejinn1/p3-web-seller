import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type PickupTimeProps = {
  className?: string;
  label?: string;
  slots: string[];
  value?: string;
};

export function PickupTime({
  className,
  label = "픽업 시간",
  slots,
  value,
}: PickupTimeProps) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="flex items-center gap-1.5 text-seller-body font-medium">
        <Clock3 aria-hidden="true" className="size-4" />
        {label}
      </legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <label className="cursor-pointer" key={slot}>
            <input
              className="peer sr-only"
              defaultChecked={value === slot}
              name="pickup-time"
              type="radio"
              value={slot}
            />
            <span className="peer-checked:text-text-inverse flex h-10 items-center justify-center rounded-seller-control border border-seller-border text-sm transition-colors peer-checked:border-seller-primary peer-checked:bg-seller-primary hover:border-seller-primary">
              {slot}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
