import { Button } from "@/components/common/button";
import { OnboardingHeader } from "@/features/onboarding/ui/onboarding-header";

export function OnboardingRejectedScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <OnboardingHeader />
      <section className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <h2 className="text-seller-display-sm font-bold tracking-[-0.66px]">
          다시 한번 확인해 주세요
        </h2>
        <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
          신청 내용에 확인이 필요한 부분이 있어요.
          <br />
          사유를 보고 고친 뒤 다시 신청해 주세요.
        </p>
      </section>
      <div className="flex flex-col items-center gap-[13px] px-4 pt-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
        <Button fullWidth size="lg" variant="primary">
          다시 신청하기
        </Button>
        <a
          className="text-[13px] leading-4 font-medium tracking-[-0.13px] text-text-link"
          href="/seller"
        >
          홈으로 가기
        </a>
      </div>
    </main>
  );
}
