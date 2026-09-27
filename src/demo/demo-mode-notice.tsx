"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DEMO_MODE } from "@/demo/demo-config";
import { resetDemoDatabase } from "@/demo/demo-database";

export function DemoModeNotice() {
  const queryClient = useQueryClient();

  if (!DEMO_MODE) return null;

  return (
    <aside
      className="pointer-events-none fixed top-2 left-14 z-[100] flex items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-2 py-1 text-[11px] text-neutral-600 shadow-sm backdrop-blur"
      aria-label="데모 모드 안내"
    >
      <span>DEMO</span>
      <button
        className="pointer-events-auto font-semibold text-neutral-900 underline underline-offset-2"
        onClick={() => {
          resetDemoDatabase();
          void queryClient.resetQueries();
        }}
        type="button"
      >
        초기화
      </button>
    </aside>
  );
}
