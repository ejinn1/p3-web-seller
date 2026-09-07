import Image from "next/image";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/common/button";
import { IconButton } from "@/components/common/icon-button";
import { sellerSidebarNavigation } from "../config/seller-sidebar-navigation";
import { SellerSidebarGroup } from "./seller-sidebar-group";

type SellerSidebarProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function SellerSidebar({ onOpenChange, open }: SellerSidebarProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="seller-sidebar-overlay fixed inset-0 z-20 bg-surface-scrim" />
        <Dialog.Content asChild>
          <aside className="seller-sidebar-content fixed top-0 right-0 z-20 flex h-dvh w-[300px] flex-col gap-6 overflow-hidden bg-surface-elevated py-[41px] focus:outline-none">
            <Dialog.Title className="sr-only">판매자 메뉴</Dialog.Title>
            <div className="flex w-full items-center justify-between px-6">
              <Image
                alt="wihada"
                height={20}
                src="/brand/wihada-logo.svg"
                width={87}
              />
              <Dialog.Close asChild>
                <IconButton className="size-10" label="닫기">
                  <X aria-hidden="true" className="size-5" />
                </IconButton>
              </Dialog.Close>
            </div>
            <div className="h-px w-full bg-brand-subtle" />
            <nav className="flex min-h-0 flex-1 flex-col gap-8 py-6">
              {sellerSidebarNavigation.map((group) => (
                <SellerSidebarGroup key={group.title} {...group} />
              ))}
            </nav>
            <div className="px-6">
              <Button className="h-[52px] w-full rounded-seller-md text-[18px] leading-6 font-semibold tracking-[-0.54px]">
                내 스토어 보기
              </Button>
            </div>
          </aside>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
