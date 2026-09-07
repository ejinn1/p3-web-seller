import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, type = "button", ...props }, ref) => (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-seller-control text-seller-primary transition-colors hover:bg-seller-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seller-primary disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

IconButton.displayName = "IconButton";
