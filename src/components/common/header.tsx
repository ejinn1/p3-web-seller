import { Bell, ChevronLeft, Menu } from "lucide-react";
import { IconButton } from "@/components/common/icon-button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  className?: string;
  onBack?: () => void;
  onMenu?: () => void;
  onNotification?: () => void;
  title?: string;
};

export function Header({
  className,
  onBack,
  onMenu,
  onNotification,
  title = "wihada",
}: HeaderProps) {
  const hasBackButton = Boolean(onBack);

  return (
    <header
      className={cn(
        "flex h-14 items-center border-b border-seller-border bg-surface-default px-4",
        className,
      )}
    >
      {hasBackButton ? (
        <IconButton label="뒤로 가기" onClick={onBack}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </IconButton>
      ) : (
        <span className="text-seller-title font-semibold tracking-tight">
          {title}
        </span>
      )}
      {hasBackButton ? (
        <h1 className="ml-2 text-seller-title font-semibold">{title}</h1>
      ) : null}
      <div className="ml-auto flex items-center gap-1">
        <IconButton label="알림" onClick={onNotification}>
          <Bell aria-hidden="true" className="size-4" />
        </IconButton>
        <IconButton label="메뉴" onClick={onMenu}>
          <Menu aria-hidden="true" className="size-5" />
        </IconButton>
      </div>
    </header>
  );
}
