import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variantClassNames = {
  primary: "bg-seller-primary text-text-inverse hover:bg-seller-primary/90",
  secondary: "bg-seller-secondary text-seller-primary hover:bg-seller-border",
  destructive:
    "bg-brand-destructive text-text-inverse hover:bg-brand-destructive/90",
  outline:
    "border border-seller-border bg-surface-default text-seller-primary hover:bg-seller-surface",
  ghost: "text-seller-primary hover:bg-seller-secondary",
} as const;

const sizeClassNames = {
  sm: "h-8 px-3 text-seller-label",
  md: "h-10 px-4 text-seller-body",
  lg: "h-12 px-5 text-seller-body",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClassNames;
  size?: keyof typeof sizeClassNames;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      fullWidth = false,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-seller-control font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seller-primary disabled:pointer-events-none disabled:opacity-40",
        sizeClassNames[size],
        fullWidth && "w-full",
        className,
        variantClassNames[variant],
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = "Button";
