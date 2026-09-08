"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function InquiryChatComposer({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="shrink-0 bg-surface-elevated px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] shadow-[0_-12px_12px_rgba(0,0,0,0.04)]"
      onSubmit={(event) => {
        event.preventDefault();
        const content = value.trim();

        if (!content || disabled) {
          return;
        }

        onSend(content);
        setValue("");
      }}
    >
      <label className="sr-only" htmlFor="seller-chat-message">
        메시지 입력
      </label>
      <div className="flex h-[52px] items-center gap-2 rounded-seller-lg border border-border-default bg-surface-subtle p-2">
        <button
          aria-label="파일 추가"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-default text-text-disabled"
          type="button"
        >
          <Plus aria-hidden="true" className="size-6" />
        </button>
        <input
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-primary outline-none placeholder:text-text-unavailable"
          disabled={disabled}
          id="seller-chat-message"
          onChange={(event) => setValue(event.target.value)}
          placeholder="메시지 입력"
          value={value}
        />
        <button className="sr-only" disabled={disabled} type="submit">
          보내기
        </button>
      </div>
    </form>
  );
}
