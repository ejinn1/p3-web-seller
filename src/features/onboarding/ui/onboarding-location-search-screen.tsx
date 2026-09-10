"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Header } from "@/components/common/header";
import { useOnboardingLocationSearchQuery } from "@/features/onboarding/model/onboarding-queries";
import type { OnboardingLocation } from "@/features/onboarding/model/types";

type OnboardingLocationSearchScreenProps = {
  onBack: () => void;
  onDeleteRecent: (address: string) => void;
  onSelect: (location: OnboardingLocation) => void;
  recentLocations: OnboardingLocation[];
};

export function OnboardingLocationSearchScreen({
  onBack,
  onDeleteRecent,
  onSelect,
  recentLocations,
}: OnboardingLocationSearchScreenProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const normalizedQuery = query.trim();
  const normalizedDebouncedQuery = debouncedQuery.trim();
  const canSearch = normalizedQuery.length >= 2;
  const searchQuery = useOnboardingLocationSearchQuery(debouncedQuery);
  const isWaitingForSearch =
    canSearch && normalizedQuery !== normalizedDebouncedQuery;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 400);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backLabel="입점 신청으로 돌아가기"
        className="border-none"
        onBack={onBack}
        title="스토어 위치"
      />
      <section className="flex flex-1 flex-col bg-surface-default">
        <div className="bg-surface-subtle px-4 py-3">
          <div className="flex h-11 items-center gap-2 rounded-seller-sm bg-surface-default px-4">
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-text-secondary"
              strokeWidth={1.8}
            />
            <input
              aria-label="스토어 위치 검색"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable"
              maxLength={100}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="구, 동, 건물명, 역 등으로 검색"
              value={query}
            />
            {query ? (
              <button
                aria-label="검색어 지우기"
                className="flex size-6 items-center justify-center text-text-secondary"
                onClick={() => setQuery("")}
                type="button"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 px-4 pb-8">
          {!normalizedQuery ? (
            <RecentLocations
              locations={recentLocations}
              onDelete={onDeleteRecent}
              onSelect={onSelect}
            />
          ) : null}
          {normalizedQuery.length === 1 ? (
            <p className="mt-6 text-sm text-text-secondary">
              검색어를 2자 이상 입력해 주세요.
            </p>
          ) : null}
          {canSearch && (isWaitingForSearch || searchQuery.isPending) ? (
            <p className="mt-6 text-sm text-text-secondary">
              주소를 검색하고 있습니다.
            </p>
          ) : null}
          {canSearch && !isWaitingForSearch && searchQuery.isError ? (
            <p aria-live="polite" className="mt-6 text-sm text-text-error">
              주소를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
          {canSearch &&
          !isWaitingForSearch &&
          !searchQuery.isPending &&
          !searchQuery.isError ? (
            <SearchResults
              items={searchQuery.data?.items ?? []}
              onSelect={onSelect}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function RecentLocations({
  locations,
  onDelete,
  onSelect,
}: {
  locations: OnboardingLocation[];
  onDelete: (address: string) => void;
  onSelect: (location: OnboardingLocation) => void;
}) {
  return (
    <div className="mt-4">
      <h2 className="text-seller-heading-md font-semibold tracking-[-0.54px]">
        최근 검색
      </h2>
      {locations.length ? (
        <ul className="mt-2">
          {locations.map((location) => (
            <li className="flex items-start gap-2 py-2" key={location.address}>
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => onSelect(location)}
                type="button"
              >
                <span className="block truncate text-base leading-6 font-medium tracking-[-0.32px]">
                  {location.address}
                </span>
                <span className="block truncate text-sm leading-5 tracking-[-0.28px] text-text-secondary">
                  {[location.buildingName, location.jibunAddress]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
              <button
                aria-label={`${location.address} 최근 검색 삭제`}
                className="flex size-8 shrink-0 items-center justify-center text-icon-default"
                onClick={() => onDelete(location.address)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">
          최근 검색 내역이 없어요.
        </p>
      )}
    </div>
  );
}

function SearchResults({
  items,
  onSelect,
}: {
  items: {
    buildingName: string;
    roadAddress: string;
    jibunAddress: string;
    zipCode: string;
  }[];
  onSelect: (location: OnboardingLocation) => void;
}) {
  if (!items.length) {
    return (
      <p className="mt-6 text-sm text-text-secondary">검색 결과가 없습니다.</p>
    );
  }

  return (
    <ul className="mt-4">
      {items.map((item) => {
        const address = item.roadAddress || item.jibunAddress;
        return (
          <li key={`${address}-${item.zipCode}`}>
            <button
              className="flex w-full flex-col gap-1 py-3 text-left"
              onClick={() =>
                onSelect({
                  address,
                  buildingName: item.buildingName,
                  jibunAddress: item.jibunAddress,
                  zipCode: item.zipCode,
                })
              }
              type="button"
            >
              <span className="text-base leading-6 font-medium tracking-[-0.32px]">
                {address}
              </span>
              <span className="text-sm leading-5 tracking-[-0.28px] text-text-secondary">
                {[item.buildingName, item.jibunAddress, item.zipCode]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
