import { Header } from "@/components/common/header";
import { OnboardingForm } from "@/features/onboarding/ui/onboarding-form";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function SellerOnboardingScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backHref={getSellerBackHref("onboarding")}
        backLabel="로그인 화면으로 돌아가기"
        className="border-none"
        title="입점 신청"
      />
      <OnboardingForm />
    </main>
  );
}
