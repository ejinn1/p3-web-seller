"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { IconButton } from "@/components/common/icon-button";
import {
  useStoreManagementStatusQuery,
  useStoreQuery,
  useStoreShareLinkQuery,
} from "@/features/store/model/store-queries";
import { sellerSidebarNavigation } from "../config/seller-sidebar-navigation";
import { SellerSidebarGroup } from "./seller-sidebar-group";
import { SellerSidebarStoreActions } from "./seller-sidebar-store-actions";

type SellerSidebarProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function SellerSidebar({ onOpenChange, open }: SellerSidebarProps) {
  const managementStatusQuery = useStoreManagementStatusQuery();
  const storeQuery = useStoreQuery();
  const isStoreSetupComplete = managementStatusQuery.data?.canActivate ?? false;
  const isStorePublic =
    isStoreSetupComplete && storeQuery.data?.status === "ACTIVE";
  const shareLinkQuery = useStoreShareLinkQuery(open && isStorePublic);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="seller-sidebar-overlay fixed inset-y-0 left-1/2 z-20 w-full max-w-[768px] -translate-x-1/2 bg-surface-scrim"
          onClick={() => onOpenChange(false)}
        />
        <Dialog.Content asChild>
          <div className="seller-sidebar-content pointer-events-none fixed inset-y-0 left-1/2 z-20 w-full max-w-[768px] -translate-x-1/2 overflow-hidden focus:outline-none">
            <aside className="seller-sidebar-panel pointer-events-auto absolute top-0 right-0 flex h-dvh w-[300px] flex-col overflow-hidden bg-surface-elevated pb-[41px]">
              <Dialog.Title className="sr-only">판매자 메뉴</Dialog.Title>
              <div className="flex h-14 w-full shrink-0 items-center justify-between px-6">
                <Image
                  alt="wihada"
                  height={20}
                  src="/brand/wihada-logo.svg"
                  width={87}
                />
                <Dialog.Close asChild>
                  <IconButton
                    className="-mr-6 size-12 rounded-none hover:bg-transparent"
                    label="닫기"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </IconButton>
                </Dialog.Close>
              </div>
              <nav className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto py-6">
                {sellerSidebarNavigation.map((group) => (
                  <SellerSidebarGroup
                    {...group}
                    items={group.items.map((item) => ({
                      ...item,
                      disabled:
                        item.requiresStoreSetupComplete &&
                        !isStoreSetupComplete,
                    }))}
                    key={group.title}
                  />
                ))}
              </nav>
              <SellerSidebarStoreActions
                enabled={isStorePublic}
                isLoading={shareLinkQuery.isLoading}
                storeName={managementStatusQuery.data?.storeName ?? "스토어"}
                url={shareLinkQuery.data?.url}
              />
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
