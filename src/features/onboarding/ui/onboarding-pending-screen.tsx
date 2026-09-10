import { BUYER_HOME_URL } from "@/features/auth/model/authenticated-entry-route";
import { OnboardingStatusLayout } from "@/features/onboarding/ui/onboarding-status-layout";

export function OnboardingPendingScreen() {
  return (
    <OnboardingStatusLayout
      actionHref={BUYER_HOME_URL}
      actionLabel="홈으로 가기"
      description={
        <p>
          보통 하루 안에 결과를 알려드려요.
          <br />
          승인되면 알림으로 알려드릴게요.
        </p>
      }
      title="입점 신청을 검토하고 있어요"
    />
  );
}
