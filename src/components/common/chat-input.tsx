import { Send } from "lucide-react";
import { type FormEventHandler } from "react";
import { IconButton } from "@/components/common/icon-button";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  className?: string;
  disabled?: boolean;
  inputId?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  placeholder?: string;
};

export function ChatInput({
  className,
  disabled = false,
  inputId = "chat-message",
  onSubmit,
  placeholder = "메시지를 입력하세요",
}: ChatInputProps) {
  return (
    <form
      className={cn(
        "flex items-center gap-2 border-t border-seller-border bg-surface-default p-3",
        className,
      )}
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor={inputId}>
        메시지
      </label>
      <input
        className="h-10 min-w-0 flex-1 rounded-full bg-seller-surface px-4 text-sm outline-none placeholder:text-seller-muted focus:ring-2 focus:ring-seller-primary/10"
        disabled={disabled}
        id={inputId}
        name="message"
        placeholder={placeholder}
      />
      <IconButton disabled={disabled} label="메시지 보내기" type="submit">
        <Send aria-hidden="true" className="size-4" />
      </IconButton>
    </form>
  );
}
