import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => (
    <textarea
      aria-invalid={error || undefined}
      className={cn(
        "min-h-[88px] w-full resize-none rounded-seller-sm border bg-surface-subtle px-4 py-2 text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable focus:border-border-focus disabled:cursor-not-allowed disabled:bg-surface-subtle",
        error ? "border-seller-danger" : "border-transparent",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
