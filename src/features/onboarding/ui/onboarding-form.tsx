"use client";

import { Button } from "@/components/common/button";
import { Field } from "@/components/common/field";
import { useCreateOnboardingMutation } from "@/features/onboarding/model/onboarding-mutations";
import type { SellerOnboardingInput } from "@/features/onboarding/model/types";
import { OnboardingTextField } from "@/features/onboarding/ui/onboarding-text-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  storeName: z.string().trim().min(1, "스토어 이름을 입력해 주세요.").max(100),
  address: z.string().trim().min(1, "가게 주소를 입력해 주세요.").max(100),
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

const fieldLabelClassName =
  "text-[18px] leading-6 font-semibold tracking-[-0.54px] [&>span]:text-[15px] [&>span]:leading-5 [&>span]:tracking-[-0.3px]";

export function OnboardingForm() {
  const router = useRouter();
  const createMutation = useCreateOnboardingMutation();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: "",
      address: "",
      name: "",
      phoneNumber: "",
      snsLink: "",
    },
  });
  const [storeName, address, name, phoneNumber, snsLink] = useWatch({
    control: form.control,
    name: ["storeName", "address", "name", "phoneNumber", "snsLink"],
  });

  async function onSubmit(values: Values) {
    const input: SellerOnboardingInput = {
      storeName: values.storeName.trim(),
      address: values.address.trim(),
      phoneNumber: values.phoneNumber.trim(),
      snsLink: values.snsLink.trim() || null,
    };
    await createMutation.mutateAsync(input);
    router.replace("/onboarding/pending");
  }

  return (
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
          requiredPosition="before"
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
          label="가게 주소"
          labelClassName={fieldLabelClassName}
          required
          requiredPosition="before"
        >
          <OnboardingTextField
            {...form.register("address")}
            error={Boolean(form.formState.errors.address)}
            id="store-address"
            placeholder="ex: 서울특별시 서대문구 연희동 120-2"
            value={address}
          />
        </Field>
        <Field
          error={form.formState.errors.name?.message}
          htmlFor="applicant-name"
          label="이름"
          labelClassName={fieldLabelClassName}
          required
          requiredPosition="before"
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
          requiredPosition="before"
        >
          <OnboardingTextField
            {...form.register("phoneNumber")}
            error={Boolean(form.formState.errors.phoneNumber)}
            id="store-phone"
            placeholder="ex: 02-0000-0000"
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
          disabled={createMutation.isPending}
          fullWidth
          size="lg"
          type="submit"
        >
          {createMutation.isPending ? "처리 중..." : "신청하기"}
        </Button>
      </div>
    </form>
  );
}
