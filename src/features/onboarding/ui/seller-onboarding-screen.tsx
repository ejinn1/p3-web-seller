import { Header } from "@/components/common/header";
import { OnboardingForm } from "@/features/onboarding/ui/onboarding-form";

export function SellerOnboardingScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backHref="/seller"
        backLabel="로그인 화면으로 돌아가기"
        className="border-none"
        title="입점 신청"
      />
      <OnboardingForm />
    </main>
  );
}
