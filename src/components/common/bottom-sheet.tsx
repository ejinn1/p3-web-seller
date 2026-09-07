import { cn } from "@/lib/utils";
import { Dialog } from "radix-ui";
import { type ReactNode } from "react";

type BottomSheetProps = {
  children: ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BottomSheet({
  children,
  className,
  onOpenChange,
  open,
}: BottomSheetProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="bottom-sheet-overlay fixed inset-0 z-50 bg-surface-scrim" />
        <Dialog.Content
          className={cn(
            "bottom-sheet-content fixed right-0 bottom-0 left-0 z-50 mx-auto flex w-full max-w-[390px] flex-col rounded-t-seller-lg bg-surface-default px-4 pt-8 pb-[34px] focus:outline-none",
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
