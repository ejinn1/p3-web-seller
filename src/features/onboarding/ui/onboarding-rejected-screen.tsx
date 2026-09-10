"use client";

import { useCurrentOnboardingQuery } from "@/features/onboarding/model/onboarding-queries";
import { OnboardingStatusLayout } from "@/features/onboarding/ui/onboarding-status-layout";

export function OnboardingRejectedScreen() {
  const onboardingQuery = useCurrentOnboardingQuery();
  const rejectionReason = onboardingQuery.data?.rejectionReason?.trim();

  return (
    <OnboardingStatusLayout
      actionHref="/onboarding"
      actionLabel="다시 신청하기"
      description={
        <p>
          신청 내용에 확인이 필요한 부분이 있어요.
          <br />
          사유를 보고 고친 뒤 다시 신청해 주세요.
        </p>
      }
      title="다시 한번 확인해 주세요"
    >
      {rejectionReason ? (
        <div className="mt-6 max-w-full space-y-1 text-center">
          <p className="text-[13px] leading-[18px] font-medium tracking-[-0.13px] text-text-tertiary">
            반려 사유
          </p>
          <p className="max-w-[358px] text-seller-body-md tracking-[-0.32px] break-words whitespace-pre-line text-text-primary">
            {rejectionReason}
          </p>
        </div>
      ) : null}
    </OnboardingStatusLayout>
  );
}
