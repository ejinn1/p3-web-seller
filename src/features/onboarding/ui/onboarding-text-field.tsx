import { type InputHTMLAttributes, forwardRef } from "react";
import { Input } from "@/components/common/input";

type OnboardingTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "maxLength"
> & {
  error?: boolean;
  maxLength?: number;
  value: string;
};

export const OnboardingTextField = forwardRef<
  HTMLInputElement,
  OnboardingTextFieldProps
>(({ error = false, maxLength = 100, value, ...props }, ref) => (
  <div className="space-y-1">
    <Input
      {...props}
      className="h-11 rounded-xl border-0 bg-surface-subtle px-4 text-base leading-6 tracking-[-0.32px] placeholder:text-text-disabled focus:ring-2 focus:ring-brand-primary/20"
      error={error}
      maxLength={maxLength}
      ref={ref}
    />
    <p className="text-right text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-disabled">
      {value.length}/{maxLength}
    </p>
  </div>
));

OnboardingTextField.displayName = "OnboardingTextField";
