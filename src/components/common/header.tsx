import { Bell, ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import { IconButton } from "@/components/common/icon-button";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  backHref?: string;
  backLabel?: string;
  className?: string;
  leading?: ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  onNotification?: () => void;
  showMenu?: boolean;
  showNotification?: boolean;
  title?: ReactNode;
  titleClassName?: string;
  trailing?: ReactNode;
};

export function Header({
  backHref,
  backLabel = "뒤로 가기",
  className,
  leading,
  onBack,
  onMenu,
  onNotification,
  showMenu = false,
  showNotification = false,
  title,
  titleClassName,
  trailing,
}: HeaderProps) {
  const hasBackButton = Boolean(backHref || onBack);
  const titleTypographyClass =
    titleClassName ??
    "text-seller-display-sm font-bold tracking-[-0.66px] text-text-primary";

  const backButton = backHref ? (
    <Link
      aria-label={backLabel}
      className="flex size-12 items-center justify-center text-icon-default"
      href={backHref}
    >
      <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
    </Link>
  ) : (
    <IconButton className="size-12" label={backLabel} onClick={onBack}>
      <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={2} />
    </IconButton>
  );

  return (
    <header
      className={cn(
        "relative flex h-14 shrink-0 items-center border-b border-seller-border bg-surface-default",
        className,
      )}
    >
      {hasBackButton ? (
        backButton
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center">
          {leading}
        </div>
      )}
      {title ? (
        <h1
          className={`pointer-events-none absolute inset-x-12 text-center ${titleTypographyClass}`}
        >
          {title}
        </h1>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center">
        {trailing}
        {showNotification ? (
          onNotification ? (
            <IconButton
              className="size-12"
              label="알림"
              onClick={onNotification}
            >
              <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </IconButton>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center text-icon-default"
            >
              <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
          )
        ) : null}
        {showMenu ? (
          onMenu ? (
            <IconButton className="size-12" label="메뉴" onClick={onMenu}>
              <Menu aria-hidden="true" className="size-6" strokeWidth={2} />
            </IconButton>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center text-icon-default"
            >
              <Menu aria-hidden="true" className="size-6" strokeWidth={2} />
            </span>
          )
        ) : null}
      </div>
    </header>
  );
}
