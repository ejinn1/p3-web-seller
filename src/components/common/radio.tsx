import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, disabled, ...props }, ref) => (
    <span className={cn("relative inline-flex size-8 shrink-0", className)}>
      <input
        className="peer absolute top-[7px] left-0 z-10 m-0 size-[18px] cursor-pointer opacity-0 disabled:cursor-not-allowed"
        disabled={disabled}
        ref={ref}
        type="radio"
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[7px] left-0 size-[18px] rounded-full border-2 border-border-strong peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus peer-disabled:border-border-subtle"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[11px] left-1 hidden size-[10px] rounded-full bg-icon-default peer-checked:block peer-disabled:bg-icon-disabled"
      />
    </span>
  ),
);

Radio.displayName = "Radio";

export function RadioIndicator({
  checked = false,
  className,
  disabled = false,
}: {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex size-8 shrink-0", className)}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-[7px] left-0 size-[18px] rounded-full border-2",
          disabled ? "border-border-subtle" : "border-border-strong",
        )}
      />
      {checked ? (
        <span
          className={cn(
            "pointer-events-none absolute top-[11px] left-1 size-[10px] rounded-full",
            disabled ? "bg-icon-disabled" : "bg-icon-default",
          )}
        />
      ) : null}
    </span>
  );
}
