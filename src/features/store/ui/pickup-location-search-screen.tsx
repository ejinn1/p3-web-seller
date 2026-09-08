"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/common/header";
import { useStoreLocationSearchQuery } from "@/features/store/model/store-queries";

type PickupLocationSearchScreenProps = {
  onBack: () => void;
  onSelect: (address: string) => void;
};

export function PickupLocationSearchScreen({
  onBack,
  onSelect,
}: PickupLocationSearchScreenProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const searchQuery = useStoreLocationSearchQuery(query);
  const canSearch = normalizedQuery.length >= 2;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backLabel="이전 화면으로 돌아가기"
        className="border-none"
        onBack={onBack}
        title="픽업 장소"
      />
      <section className="flex flex-1 flex-col px-4 pt-6">
        <div className="flex h-11 items-center gap-2 rounded-seller-sm bg-surface-subtle px-4">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-text-secondary"
            strokeWidth={1.8}
          />
          <input
            aria-label="픽업 장소 검색"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-base leading-6 tracking-[-0.32px] outline-none placeholder:text-text-unavailable"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="도로명, 지번, 건물명으로 검색"
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
        {normalizedQuery.length === 1 ? (
          <p className="mt-6 text-sm text-text-secondary">
            검색어를 2자 이상 입력해 주세요.
          </p>
        ) : null}
        {canSearch && searchQuery.isPending ? (
          <p className="mt-6 text-sm text-text-secondary">
            주소를 검색하고 있습니다.
          </p>
        ) : null}
        {canSearch && searchQuery.isError ? (
          <p aria-live="polite" className="mt-6 text-sm text-text-error">
            주소를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {canSearch && !searchQuery.isPending && !searchQuery.isError ? (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-text-secondary">
              검색 결과
            </p>
            {searchQuery.data?.items.length ? (
              searchQuery.data.items.map((item) => {
                const address = item.roadAddress || item.jibunAddress;

                return (
                  <button
                    className="flex w-full flex-col gap-1 border-b border-border-subtle py-4 text-left"
                    key={`${address}-${item.zipCode}`}
                    onClick={() => onSelect(address)}
                    type="button"
                  >
                    <span className="text-base leading-6 font-medium tracking-[-0.32px]">
                      {address}
                    </span>
                    <span className="text-sm leading-5 text-text-secondary">
                      {[item.buildingName, item.jibunAddress, item.zipCode]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="py-4 text-sm text-text-secondary">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
