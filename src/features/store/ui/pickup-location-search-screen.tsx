"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { PickupLocationHeader } from "./pickup-location-header";

type PickupLocationSearchScreenProps = {
  onBack: () => void;
  onSelect: (address: string) => void;
};

export function PickupLocationSearchScreen({
  onBack,
}: PickupLocationSearchScreenProps) {
  const [query, setQuery] = useState("");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <PickupLocationHeader onBack={onBack} />
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
      </section>
    </main>
  );
}
