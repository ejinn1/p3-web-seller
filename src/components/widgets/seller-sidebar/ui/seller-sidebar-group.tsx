import Link from "next/link";
import type { SellerSidebarNavigationGroup } from "../config/seller-sidebar-navigation";

type SellerSidebarGroupProps = SellerSidebarNavigationGroup;

export function SellerSidebarGroup({ items, title }: SellerSidebarGroupProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="px-6 text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-secondary">
        {title}
      </p>
      {items.map((item, index) => (
        <div key={item.href}>
          <Link
            className="flex h-6 items-center px-6 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary"
            href={item.href}
          >
            {item.label}
          </Link>
          {index < items.length - 1 ? (
            <div className="mx-6 mt-4 h-px bg-surface-subtle opacity-90" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
