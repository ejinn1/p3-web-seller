import { Check } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode } from "react";
import { Card } from "@/components/common/card";
import { cn } from "@/lib/utils";

type AgreementItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

export function AgreementItem({
  className,
  id,
  label,
  ...props
}: AgreementItemProps) {
  const inputId = id ?? `agreement-${label}`;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-seller-control bg-seller-surface p-3",
        className,
      )}
      htmlFor={inputId}
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <input
          className="peer sr-only"
          id={inputId}
          type="checkbox"
          {...props}
        />
        <span className="size-5 rounded-full border border-seller-border bg-surface-default peer-checked:border-seller-primary peer-checked:bg-seller-primary" />
        <Check
          aria-hidden="true"
          className="text-text-inverse pointer-events-none absolute size-3.5 opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function Agreement({ children }: { children: ReactNode }) {
  return <Card className="space-y-2">{children}</Card>;
}
