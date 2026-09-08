"use client";

import { type FormEvent, useState } from "react";
import { LoaderCircle, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function InquiryChatComposer({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (content: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const content = value.trim();
  const inputDisabled = disabled || isSending;
  const sendDisabled = inputDisabled || !content;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sendDisabled) {
      return;
    }

    setIsSending(true);

    try {
      await onSend(content);
      setValue("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      className="shrink-0 bg-surface-elevated px-4 pt-4 pb-[calc(34px+env(safe-area-inset-bottom))] shadow-[0_-12px_12px_rgba(0,0,0,0.04)]"
      onSubmit={handleSubmit}
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
          disabled={inputDisabled}
          id="seller-chat-message"
          onChange={(event) => setValue(event.target.value)}
          placeholder="메시지 입력"
          value={value}
        />
        <button
          aria-label={isSending ? "메시지 보내는 중" : "메시지 보내기"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
            sendDisabled
              ? "bg-surface-default text-text-unavailable"
              : "bg-brand-primary text-icon-inverse hover:bg-brand-primary-hover",
          )}
          data-qa="chat-send-button"
          disabled={sendDisabled}
          type="submit"
        >
          {isSending ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>
    </form>
  );
}
