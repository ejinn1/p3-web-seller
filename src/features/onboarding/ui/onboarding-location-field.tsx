type OnboardingLocationFieldProps = {
  error?: boolean;
  id: string;
  onClick: () => void;
  value: string;
};

export function OnboardingLocationField({
  error = false,
  id,
  onClick,
  value,
}: OnboardingLocationFieldProps) {
  return (
    <button
      className={`flex min-h-11 w-full items-center rounded-xl bg-surface-subtle px-4 py-2 text-left text-base leading-6 tracking-[-0.32px] focus:ring-2 focus:ring-brand-primary/20 focus:outline-none ${
        error ? "ring-1 ring-border-error" : ""
      }`}
      id={id}
      onClick={onClick}
      type="button"
    >
      <span className={value ? "text-text-primary" : "text-text-unavailable"}>
        {value || "스토어 위치를 검색해 주세요"}
      </span>
    </button>
  );
}
