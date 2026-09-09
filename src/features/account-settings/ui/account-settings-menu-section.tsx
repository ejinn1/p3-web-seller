import { ChevronRight } from "lucide-react";

type AccountSettingsMenuItem = {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  showChevron?: boolean;
};

export function AccountSettingsMenuSection({
  items,
  title,
}: {
  items: AccountSettingsMenuItem[];
  title: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-disabled">
        {title}
      </h2>
      <div className="overflow-hidden rounded-seller-sm bg-surface-subtle">
        {items.map((item) => (
          <button
            className="flex h-14 w-full items-center justify-between gap-5 px-4 text-left disabled:cursor-default disabled:opacity-100"
            disabled={item.disabled}
            key={item.label}
            onClick={item.onClick}
            type="button"
          >
            <span className="text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
              {item.label}
            </span>
            {item.showChevron ? (
              <ChevronRight
                aria-hidden="true"
                className="size-6 text-icon-default"
                strokeWidth={2}
              />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
