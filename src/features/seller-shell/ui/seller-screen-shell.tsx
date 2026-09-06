import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type SellerScreenShellProps = ComponentPropsWithoutRef<"main"> & {
  desktopPreview?: boolean;
};

export function SellerScreenShell({
  children,
  className,
  desktopPreview = true,
  ...props
}: SellerScreenShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full flex-col bg-surface-default text-text-primary",
        desktopPreview && "lg:max-w-[390px]",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
