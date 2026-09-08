import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type SellerResponsiveFrameProps = ComponentPropsWithoutRef<"main">;

export function SellerResponsiveFrame({
  children,
  className,
  ...props
}: SellerResponsiveFrameProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
