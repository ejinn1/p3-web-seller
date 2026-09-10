"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { IMAGE_UPLOAD_ACCEPT } from "@/features/assets/model/image-upload";
import { cn } from "@/lib/utils";

export function AccountSettingsProfileImage({
  errorMessage,
  imageUrl,
  isPending,
  name,
  onSelectFile,
}: {
  errorMessage: string | null;
  imageUrl: string | null;
  isPending: boolean;
  name: string;
  onSelectFile: (file: File) => void;
}) {
  return (
    <section className="flex flex-col items-center">
      <label
        aria-label="프로필 사진 변경"
        className={cn(
          "relative block size-20 cursor-pointer rounded-full",
          isPending && "cursor-wait opacity-60",
        )}
      >
        <span className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-surface-subtle">
          {imageUrl ? (
            <Image
              alt="프로필 사진"
              className="object-cover"
              fill
              priority
              sizes="80px"
              src={imageUrl}
              unoptimized
            />
          ) : (
            <Image
              alt=""
              fill
              priority
              sizes="80px"
              src="/account-settings/profile-placeholder.svg"
            />
          )}
        </span>
        <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full border-2 border-surface-default bg-surface-subtle text-icon-inverse">
          <Plus aria-hidden="true" className="size-[18px]" strokeWidth={2} />
        </span>
        <input
          accept={IMAGE_UPLOAD_ACCEPT}
          className="sr-only"
          disabled={isPending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";

            if (file) {
              onSelectFile(file);
            }
          }}
          type="file"
        />
      </label>
      <p className="mt-2 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-primary">
        {name}
      </p>
      {errorMessage || isPending ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-1 text-center text-[11px] leading-4 font-medium tracking-[-0.11px]",
            errorMessage ? "text-text-error" : "text-text-tertiary",
          )}
        >
          {errorMessage ?? "프로필 사진 변경 중..."}
        </p>
      ) : null}
    </section>
  );
}
