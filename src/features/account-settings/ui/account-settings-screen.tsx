"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/common/header";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { AccountSettingsInfoCard } from "@/features/account-settings/ui/account-settings-info-card";
import { AccountSettingsMenuSection } from "@/features/account-settings/ui/account-settings-menu-section";
import { AccountSettingsProfileImage } from "@/features/account-settings/ui/account-settings-profile-image";
import { useUploadAssetMutation } from "@/features/assets/model/asset-mutations";
import { getImageUploadError } from "@/features/assets/model/image-upload";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import { clearCognitoSession } from "@/features/auth/model/cognito";
import type { SignupProvider } from "@/features/auth/model/types";
import { useUpdateSellerProfileImageMutation } from "@/features/store/model/store-mutations";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

export function AccountSettingsScreen() {
  const userQuery = useCurrentUserQuery();
  const uploadAssetMutation = useUploadAssetMutation();
  const updateSellerProfileImageMutation =
    useUpdateSellerProfileImageMutation();
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(
    null,
  );
  const user = userQuery.data;
  const profileState = userQuery.isLoading
    ? "불러오는 중"
    : userQuery.isError
      ? "불러오기 실패"
      : null;
  const isProfileImagePending =
    uploadAssetMutation.isPending || updateSellerProfileImageMutation.isPending;

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const handleProfileImageSelect = async (file: File) => {
    if (!user || isProfileImagePending) {
      return;
    }

    const validationError = getImageUploadError(file);

    if (validationError) {
      setProfileImageError(validationError);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    const previousPreviewUrl = previewUrlRef.current;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setProfileImageError(null);

    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    try {
      const uploadedAsset = await uploadAssetMutation.mutateAsync(file);
      await updateSellerProfileImageMutation.mutateAsync({
        profileAssetId: uploadedAsset.assetId,
      });
    } catch {
      URL.revokeObjectURL(nextPreviewUrl);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      setProfileImageError("프로필 사진을 변경하지 못했어요. 다시 시도해 주세요.");
    }
  };

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
      <div className="flex flex-1 overflow-y-auto px-4 pt-12 pb-[calc(34px+env(safe-area-inset-bottom))]">
        <div className="w-full space-y-4">
          <AccountSettingsProfileImage
            errorMessage={profileImageError}
            imageUrl={previewUrl ?? user?.profileImageDeliveryUrl ?? null}
            isPending={isProfileImagePending}
            name={profileState ?? user?.name ?? "-"}
            onSelectFile={(file) => void handleProfileImageSelect(file)}
          />
          <AccountSettingsInfoCard
            rowGroups={[
              [
                { label: "이름", value: profileState ?? user?.name },
                {
                  label: "전화번호",
                  value: profileState ?? formatPhoneNumber(user?.phoneNumber),
                },
              ],
              [
                {
                  label: "가입일",
                  value: profileState ?? formatJoinedDate(user?.createdAt),
                },
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

function formatJoinedDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  return year && month && day ? `${year}.${month}.${day}` : undefined;
}
