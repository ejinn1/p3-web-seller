import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarProps = {
  className?: string;
  days: Array<number | null>;
  monthLabel: string;
  selectedDay?: number;
};

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

export function Calendar({
  className,
  days,
  monthLabel,
  selectedDay,
}: CalendarProps) {
  return (
    <section
      aria-label={`${monthLabel} 달력`}
      className={cn(
        "rounded-seller-card border border-seller-border bg-surface-default p-4",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          aria-label="이전 달"
          className="rounded p-1 hover:bg-seller-secondary"
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <h2 className="text-sm font-semibold">{monthLabel}</h2>
        <button
          aria-label="다음 달"
          className="rounded p-1 hover:bg-seller-secondary"
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {weekDays.map((day) => (
          <span className="py-1 text-seller-muted" key={day}>
            {day}
          </span>
        ))}
        {days.map((day, index) => (
          <button
            aria-label={day ? `${monthLabel} ${day}일` : undefined}
            className={cn(
              "mx-auto flex size-8 items-center justify-center rounded-full hover:bg-seller-secondary disabled:hover:bg-transparent",
              day === selectedDay &&
                "text-text-inverse bg-seller-primary hover:bg-seller-primary",
            )}
            disabled={!day}
            key={`${day ?? "empty"}-${index}`}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>
    </section>
  );
}
