"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/common/button";
import { Field } from "@/components/common/field";
import { Header } from "@/components/common/header";
import { useCreateOnboardingMutation } from "@/features/onboarding/model/onboarding-mutations";
import {
  readRecentOnboardingLocations,
  removeRecentOnboardingLocation,
  saveRecentOnboardingLocation,
} from "@/features/onboarding/model/recent-onboarding-locations";
import type {
  OnboardingLocation,
  SellerOnboardingInput,
} from "@/features/onboarding/model/types";
import { OnboardingLocationDetailScreen } from "@/features/onboarding/ui/onboarding-location-detail-screen";
import { OnboardingLocationField } from "@/features/onboarding/ui/onboarding-location-field";
import { OnboardingLocationSearchScreen } from "@/features/onboarding/ui/onboarding-location-search-screen";
import { OnboardingTextField } from "@/features/onboarding/ui/onboarding-text-field";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

const schema = z.object({
  storeName: z.string().trim().min(1, "스토어 이름을 입력해 주세요.").max(100),
  address: z.string().trim().min(1, "스토어 위치를 선택해 주세요.").max(255),
  detailAddress: z.string().trim().max(100),
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(100),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "전화번호를 입력해 주세요.")
    .max(20)
    .regex(/^[0-9+()\- ]+$/, "전화번호 형식을 확인해 주세요."),
  snsLink: z
    .string()
    .trim()
    .max(100)
    .refine(
      (value) =>
        !value || /^https?:\/\/.+/.test(value) || /^@?[\w.]+$/.test(value),
      "인스타그램 계정 또는 링크 형식을 확인해 주세요.",
    ),
});

type Values = z.infer<typeof schema>;
type OnboardingView = "form" | "search" | "detail";

const fieldLabelClassName =
  "text-[18px] leading-6 font-semibold tracking-[-0.54px] [&>span]:text-[15px] [&>span]:leading-5 [&>span]:tracking-[-0.3px]";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, -4)}-${digits.slice(-4)}`;
}

export function OnboardingForm() {
  const router = useRouter();
  const createMutation = useCreateOnboardingMutation();
  const [view, setView] = useState<OnboardingView>("form");
  const [selectedLocation, setSelectedLocation] =
    useState<OnboardingLocation | null>(null);
  const [recentLocations, setRecentLocations] = useState<OnboardingLocation[]>(
    [],
  );
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: "",
      address: "",
      detailAddress: "",
      name: "",
      phoneNumber: "",
      snsLink: "",
    },
  });
  const [storeName, address, detailAddress, name, phoneNumber, snsLink] =
    useWatch({
      control: form.control,
      name: [
        "storeName",
        "address",
        "detailAddress",
        "name",
        "phoneNumber",
        "snsLink",
      ],
    });
  const hasRequiredValues = [storeName, address, name, phoneNumber].every(
    (value) => value.trim().length > 0,
  );
  const phoneNumberField = form.register("phoneNumber");
  const fullAddress = [address, detailAddress].filter(Boolean).join(" ");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setRecentLocations(readRecentOnboardingLocations()),
      0,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function onSubmit(values: Values) {
    const input: SellerOnboardingInput = {
      storeName: values.storeName.trim(),
      address: values.address.trim(),
      detailAddress: values.detailAddress.trim() || null,
      phoneNumber: values.phoneNumber.trim(),
      snsLink: values.snsLink.trim() || null,
    };
    await createMutation.mutateAsync(input);
    router.replace("/onboarding/pending");
  }

  if (view === "search") {
    return (
      <OnboardingLocationSearchScreen
        onBack={() => setView("form")}
        onDeleteRecent={(nextAddress) =>
          setRecentLocations(removeRecentOnboardingLocation(nextAddress))
        }
        onSelect={(location) => {
          setSelectedLocation(location);
          setView("detail");
        }}
        recentLocations={recentLocations}
      />
    );
  }

  if (view === "detail" && selectedLocation) {
    return (
      <OnboardingLocationDetailScreen
        initialDetailAddress={
          selectedLocation.address === address ? detailAddress : ""
        }
        location={selectedLocation}
        onBack={() => setView("search")}
        onConfirm={(nextDetailAddress) => {
          form.setValue("address", selectedLocation.address, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue("detailAddress", nextDetailAddress, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setRecentLocations(saveRecentOnboardingLocation(selectedLocation));
          setView("form");
        }}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <Header
        backHref={getSellerBackHref("onboarding")}
        backLabel="로그인 화면으로 돌아가기"
        className="border-none"
        title="입점 신청"
      />
      <form
        className="flex flex-1 flex-col"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-4 px-4 pt-6 pb-4">
          <Field
            error={form.formState.errors.storeName?.message}
            htmlFor="store-name"
            label="스토어 이름"
            labelClassName={fieldLabelClassName}
            required
          >
            <OnboardingTextField
              {...form.register("storeName")}
              error={Boolean(form.formState.errors.storeName)}
              id="store-name"
              placeholder="ex: 위하다, wihada"
              value={storeName}
            />
          </Field>
          <Field
            error={form.formState.errors.address?.message}
            htmlFor="store-address"
            label="스토어 위치"
            labelClassName={fieldLabelClassName}
            required
          >
            <OnboardingLocationField
              error={Boolean(form.formState.errors.address)}
              id="store-address"
              onClick={() => setView("search")}
              value={fullAddress}
            />
          </Field>
          <Field
            error={form.formState.errors.name?.message}
            htmlFor="applicant-name"
            label="이름"
            labelClassName={fieldLabelClassName}
            required
          >
            <OnboardingTextField
              {...form.register("name")}
              error={Boolean(form.formState.errors.name)}
              id="applicant-name"
              placeholder="ex: 위하다, wihada"
              value={name}
            />
          </Field>
          <Field
            error={form.formState.errors.phoneNumber?.message}
            htmlFor="store-phone"
            label="전화번호"
            labelClassName={fieldLabelClassName}
            required
          >
            <OnboardingTextField
              {...phoneNumberField}
              error={Boolean(form.formState.errors.phoneNumber)}
              id="store-phone"
              inputMode="numeric"
              maxLength={13}
              onChange={(event) => {
                event.target.value = formatPhoneNumber(event.target.value);
                phoneNumberField.onChange(event);
              }}
              placeholder="ex: 010-0000-0000"
              type="tel"
              value={phoneNumber}
            />
          </Field>
          <Field
            error={form.formState.errors.snsLink?.message}
            htmlFor="store-instagram"
            label="스토어 인스타그램"
            labelClassName="text-[18px] leading-6 font-semibold tracking-[-0.54px]"
          >
            <OnboardingTextField
              {...form.register("snsLink")}
              error={Boolean(form.formState.errors.snsLink)}
              id="store-instagram"
              placeholder="ex: @wihada"
              type="url"
              value={snsLink}
            />
          </Field>
          {createMutation.error ? (
            <p aria-live="polite" className="text-sm text-text-error">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."}
            </p>
          ) : null}
        </div>
        <div className="mt-auto px-4 pt-4 pb-[max(2.125rem,env(safe-area-inset-bottom))]">
          <Button
            className="h-[52px] rounded-2xl text-[18px] leading-6 font-semibold tracking-[-0.54px]"
            disabled={createMutation.isPending || !hasRequiredValues}
            fullWidth
            size="lg"
            type="submit"
          >
            {createMutation.isPending ? "처리 중..." : "신청하기"}
          </Button>
        </div>
      </form>
    </main>
  );
}
