import { X } from "lucide-react";
import { Input } from "@/components/common/input";

type NoticeItemInputProps = {
  onChange: (content: string) => void;
  onClear?: () => void;
  value: string;
};

export function NoticeItemInput({
  onChange,
  onClear,
  value,
}: NoticeItemInputProps) {
  return (
    <label className="flex flex-col items-end gap-1">
      <span className="relative w-full">
        <Input
          className="border-0 bg-surface-subtle px-4 pr-12 text-seller-heading-md font-semibold tracking-[-0.54px] placeholder:text-text-unavailable"
          maxLength={100}
          onChange={(event) => onChange(event.target.value)}
          placeholder="공지 내용을 입력해주세요"
          value={value}
        />
        {onClear && value ? (
          <button
            aria-label="입력한 공지 내용 지우기"
            className="absolute top-1/2 right-0 flex size-12 -translate-y-1/2 items-center justify-center text-text-secondary"
            onClick={onClear}
            type="button"
          >
            <X aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        ) : null}
      </span>
      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
        {value.length}/100
      </span>
    </label>
  );
}
