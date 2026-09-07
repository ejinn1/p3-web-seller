import { cn } from "@/lib/utils";
import { Radio } from "@/components/common/radio";

type OptionListProps = {
  className?: string;
  name: string;
  options: Array<{ description?: string; label: string; value: string }>;
  value?: string;
};

export function OptionList({
  className,
  name,
  options,
  value,
}: OptionListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-seller-border rounded-seller-card border border-seller-border",
        className,
      )}
    >
      {options.map((option) => (
        <label
          className="flex cursor-pointer items-center gap-3 p-3"
          key={option.value}
        >
          <Radio
            defaultChecked={option.value === value}
            name={name}
            value={option.value}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{option.label}</span>
            {option.description ? (
              <span className="block text-xs text-seller-muted">
                {option.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}
