"use client";

import { useState } from "react";
import { Header, type HeaderProps } from "@/components/common/header";
import { SellerSidebar } from "@/components/widgets/seller-sidebar";

type SellerMenuHeaderProps = Omit<HeaderProps, "onMenu" | "showMenu">;

export function SellerMenuHeader(props: SellerMenuHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header {...props} onMenu={() => setSidebarOpen(true)} showMenu />
      <SellerSidebar onOpenChange={setSidebarOpen} open={sidebarOpen} />
    </>
  );
}
