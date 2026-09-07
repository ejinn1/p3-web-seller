import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  descriptionClassName?: string;
  error?: string;
  errorClassName?: string;
  htmlFor?: string;
  label: string;
  labelClassName?: string;
  requiredPosition?: "after" | "before";
  required?: boolean;
};

export function Field({
  children,
  className,
  description,
  descriptionClassName,
  error,
  errorClassName,
  htmlFor,
  label,
  labelClassName,
  requiredPosition = "after",
  required = false,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        className={cn(
          "flex items-center gap-1 text-seller-body font-medium",
          labelClassName,
        )}
        htmlFor={htmlFor}
      >
        {required && requiredPosition === "before" ? (
          <span aria-hidden="true" className="text-seller-danger">
            *
          </span>
        ) : null}
        {label}
        {required && requiredPosition === "after" ? (
          <span aria-hidden="true" className="text-seller-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className={cn("text-xs text-seller-danger", errorClassName)}>
          {error}
        </p>
      ) : null}
      {!error && description ? (
        <p className={cn("text-xs text-seller-muted", descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
