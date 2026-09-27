"use client";

import { useEffect } from "react";
import { DEMO_MODE } from "@/demo/demo-config";
import { hasCognitoSession } from "@/features/auth/model/cognito";

type SellerAuthGuardProps = {
  children: React.ReactNode;
};

export function SellerAuthGuard({ children }: SellerAuthGuardProps) {
  useEffect(() => {
    if (DEMO_MODE) return;
    if (!hasCognitoSession()) {
      window.location.replace("/seller");
    }
  }, []);

  return children;
}
