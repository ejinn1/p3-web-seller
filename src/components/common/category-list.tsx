import { ChevronRight } from "lucide-react";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CategoryListProps = {
  className?: string;
  items: Array<
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "onClick"> & {
      label: string;
      value: string;
    }
  >;
};

export function CategoryList({ className, items }: CategoryListProps) {
  return (
    <ul
      className={cn(
        "divide-y divide-seller-border rounded-seller-card border border-seller-border",
        className,
      )}
    >
      {items.map(({ label, value, ...buttonProps }) => (
        <li key={value}>
          <button
            className="flex w-full items-center gap-3 p-3 text-left text-sm font-medium hover:bg-seller-surface disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            {...buttonProps}
          >
            {label}
            <ChevronRight
              aria-hidden="true"
              className="ml-auto size-4 text-seller-muted"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
