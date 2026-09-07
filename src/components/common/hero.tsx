import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeroProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  image?: ReactNode;
  title: ReactNode;
};

export function Hero({
  action,
  className,
  description,
  image,
  title,
}: HeroProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-seller-card bg-seller-secondary",
        className,
      )}
    >
      {image ? (
        <div className="aspect-[16/9] bg-seller-border">{image}</div>
      ) : null}
      <div className="space-y-2 p-5">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <div className="text-sm leading-5 text-seller-muted">
            {description}
          </div>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </section>
  );
}
