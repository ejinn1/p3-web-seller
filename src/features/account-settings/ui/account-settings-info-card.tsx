type AccountSettingsInfoRow = {
  label: string;
  value: string | null | undefined;
};

export function AccountSettingsInfoCard({
  rowGroups,
  title,
}: {
  rowGroups: AccountSettingsInfoRow[][];
  title: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] leading-4 font-medium tracking-[-0.11px] text-text-disabled">
        {title}
      </h2>
      <div className="space-y-2">
        {rowGroups.map((rows, groupIndex) => (
          <div
            className="overflow-hidden rounded-seller-sm bg-surface-subtle"
            key={groupIndex}
          >
            {rows.map((row) => (
              <div
                className="flex h-14 items-center justify-between gap-5 px-4"
                key={row.label}
              >
                <span className="shrink-0 text-[18px] leading-6 font-semibold tracking-[-0.54px] text-text-primary">
                  {row.label}
                </span>
                <span className="min-w-0 truncate text-right text-[16px] leading-6 font-normal tracking-[-0.32px] text-text-secondary">
                  {row.value || "-"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
