import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

type SettingRowProps = {
  completed: boolean;
  disabled?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
};

export function SettingRow({
  completed,
  disabled = false,
  href,
  label,
  onClick,
}: SettingRowProps) {
  const content = (
    <>
      <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden p-[3px]">
        <span
          aria-hidden="true"
          className={
            completed
              ? "flex size-[18px] items-center justify-center rounded-[6px] bg-text-secondary text-text-inverse"
              : "size-[18px] rounded-[6px] border border-[#b8b9bb] bg-[#d0d0d2]"
          }
        >
          {completed ? (
            <Check aria-hidden="true" className="size-3" strokeWidth={3} />
          ) : null}
        </span>
      </span>
      <span className="text-seller-heading-md font-semibold tracking-[-0.54px]">
        {label}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="ml-auto size-6 shrink-0 text-text-secondary"
      />
    </>
  );
  const className =
    "flex h-[87.8px] w-full items-center gap-5 rounded-seller-sm bg-surface-subtle px-4 text-left transition-colors hover:bg-seller-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seller-primary";

  return href ? (
    <Link className={className} href={href}>
      {content}
    </Link>
  ) : (
    <button className={className} disabled={disabled} onClick={onClick} type="button">
      {content}
    </button>
  );
}
