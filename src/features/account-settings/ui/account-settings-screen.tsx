"use client";

import { Header } from "@/components/common/header";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { AccountSettingsInfoCard } from "@/features/account-settings/ui/account-settings-info-card";
import { AccountSettingsMenuSection } from "@/features/account-settings/ui/account-settings-menu-section";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import { clearCognitoSession } from "@/features/auth/model/cognito";
import type { SignupProvider } from "@/features/auth/model/types";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function AccountSettingsScreen() {
  const userQuery = useCurrentUserQuery();
  const user = userQuery.data;
  const profileState = userQuery.isLoading
    ? "불러오는 중"
    : userQuery.isError
      ? "불러오기 실패"
      : null;

  const handleLogout = () => {
    clearCognitoSession();
    window.location.replace("/seller");
  };

  return (
    <SellerResponsiveFrame>
      <Header
        backHref={getSellerBackHref("accountSettings")}
        backLabel="판매자 홈으로 돌아가기"
        className="border-b-0"
        title="마이페이지"
        titleClassName="text-[20px] leading-7 font-bold tracking-[-0.6px] text-text-primary"
      />
      <div className="flex flex-1 overflow-y-auto px-4 py-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <div className="my-auto w-full space-y-4">
          <AccountSettingsInfoCard
            rowGroups={[
              [
                { label: "이름", value: profileState ?? user?.name },
                { label: "생년월일", value: undefined },
                {
                  label: "전화번호",
                  value: profileState ?? formatPhoneNumber(user?.phoneNumber),
                },
              ],
              [
                { label: "가입일", value: undefined },
                {
                  label: "소셜연동",
                  value:
                    profileState ?? formatSignupProvider(user?.signupProvider),
                },
              ],
            ]}
            title="개인 정보"
          />
          <AccountSettingsMenuSection
            items={[{ disabled: true, label: "알림 설정", showChevron: true }]}
            title="알림"
          />
          <AccountSettingsMenuSection
            items={[
              { disabled: true, label: "약관 및 정책" },
              { disabled: true, label: "문의하기" },
            ]}
            title="계정"
          />
          <div className="flex items-center justify-center gap-4 text-[13px] leading-4 font-normal tracking-[-0.13px] text-text-disabled">
            <button disabled type="button">
              회원탈퇴
            </button>
            <span aria-hidden="true" className="h-3 w-px bg-border-default" />
            <button onClick={handleLogout} type="button">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </SellerResponsiveFrame>
  );
}

function formatPhoneNumber(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";

  if (digits.length !== 11) {
    return value || undefined;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatSignupProvider(provider: SignupProvider | null | undefined) {
  if (provider === "KAKAO") {
    return "카카오";
  }

  if (provider === "GOOGLE") {
    return "구글";
  }

  return undefined;
}
