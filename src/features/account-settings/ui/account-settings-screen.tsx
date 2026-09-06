"use client";

import { ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import {
  useStoreQuery,
  useStoreSettingsQuery,
  useStoreShareLinkQuery,
} from "@/features/store/model/store-queries";
import { SellerScreenShell } from "@/features/seller-shell/ui/seller-screen-shell";

export function AccountSettingsScreen() {
  const userQuery = useCurrentUserQuery();
  const storeQuery = useStoreQuery();
  const settingsQuery = useStoreSettingsQuery();
  const shareLinkQuery = useStoreShareLinkQuery();

  return (
    <SellerScreenShell className="bg-surface-subtle">
      <header className="grid h-14 shrink-0 grid-cols-[48px_1fr_48px] items-center bg-surface-default">
        <Link
          aria-label="이전 화면으로 돌아가기"
          className="flex size-12 items-center justify-center text-icon-default"
          href="/seller/home"
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
        </Link>
        <h1 className="text-center text-[22px] leading-[30px] font-bold tracking-[-0.66px] text-text-primary">
          계정 설정
        </h1>
        <button
          aria-label="메뉴 열기"
          className="flex size-12 items-center justify-center text-icon-default"
          type="button"
        >
          <Menu aria-hidden="true" className="size-6" strokeWidth={2} />
        </button>
      </header>
      <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <SettingsCard
          rows={[
            ["이름", userQuery.data?.name],
            ["이메일", userQuery.data?.email],
            ["권한", userQuery.data?.role],
          ]}
          state={stateLabel(userQuery)}
          title="계정 정보"
        />
        <SettingsCard
          rows={[
            ["스토어명", storeQuery.data?.name],
            ["상태", storeQuery.data?.status],
            ["주소", storeQuery.data?.address],
            ["연락처", storeQuery.data?.contact],
          ]}
          state={stateLabel(storeQuery)}
          title="스토어 정보"
        />
        <SettingsCard
          rows={[
            ["주문 리드타임", formatMinutes(settingsQuery.data?.leadTimeMinutes)],
            ["취소 마감", formatDays(settingsQuery.data?.cancellationCutoffDays)],
            ["휴무일", settingsQuery.data?.holidays.join(", ")],
          ]}
          state={stateLabel(settingsQuery)}
          title="운영 설정"
        />
        <SettingsCard
          rows={[
            ["슬러그", shareLinkQuery.data?.slug],
            ["공유 링크", shareLinkQuery.data?.url],
          ]}
          state={stateLabel(shareLinkQuery)}
          title="공유 링크"
        />
      </section>
    </SellerScreenShell>
  );
}

function SettingsCard({
  rows,
  state,
  title,
}: {
  rows: Array<[string, string | null | undefined]>;
  state: string | null;
  title: string;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-seller-sm bg-surface-default p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
          {title}
        </h2>
        {state ? (
          <span className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
            {state}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div className="flex items-start justify-between gap-4" key={label}>
            <p className="shrink-0 text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-tertiary">
              {label}
            </p>
            <p className="min-w-0 text-right text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary break-words">
              {value || "-"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function stateLabel(query: { isError: boolean; isLoading: boolean }) {
  if (query.isLoading) {
    return "불러오는 중";
  }

  if (query.isError) {
    return "불러오기 실패";
  }

  return null;
}

function formatMinutes(value: number | undefined) {
  return typeof value === "number" ? `${value}분` : undefined;
}

function formatDays(value: number | undefined) {
  return typeof value === "number" ? `${value}일 전` : undefined;
}
