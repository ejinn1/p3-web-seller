import type { ReactNode } from "react";

import { Header } from "@/components/common/header";

type OnboardingStatusLayoutProps = {
  actionHref: string;
  actionLabel: string;
  children?: ReactNode;
  description: ReactNode;
  title: string;
};

export function OnboardingStatusLayout({
  actionHref,
  actionLabel,
  children,
  description,
  title,
}: OnboardingStatusLayoutProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backHref="/auth/role"
        backLabel="역할 선택 화면으로 돌아가기"
        className="border-none"
      />
      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-seller-display-sm font-bold tracking-[-0.66px]">
          {title}
        </h1>
        <div className="mt-2 text-seller-body-md tracking-[-0.32px] text-text-secondary">
          {description}
        </div>
        {children}
      </section>
      <div className="px-4 pt-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
        <a
          className="flex h-12 w-full items-center justify-center rounded-seller-control bg-surface-inverse px-5 text-seller-title font-medium text-text-inverse transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          href={actionHref}
        >
          {actionLabel}
        </a>
      </div>
    </main>
  );
}
