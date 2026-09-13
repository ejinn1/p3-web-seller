import { Input } from "@/components/common/input";

type NoticeItemInputProps = {
  onChange: (content: string) => void;
  readOnly?: boolean;
  value: string;
};

export function NoticeItemInput({
  onChange,
  readOnly = false,
  value,
}: NoticeItemInputProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="relative w-full">
        <Input
          aria-label="공지 내용"
          className="border-0 bg-surface-subtle px-4 text-seller-heading-md font-semibold tracking-[-0.54px] placeholder:text-text-unavailable read-only:cursor-default"
          maxLength={100}
          onChange={(event) => onChange(event.target.value)}
          placeholder="공지 내용을 입력해주세요"
          readOnly={readOnly}
          value={value}
        />
      </span>
      <span className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
        {value.length}/100
      </span>
    </div>
  );
}
