"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/button";
import { getAssetDeliveryUrl } from "@/features/assets/model/asset-delivery";
import { useAssetQueries } from "@/features/assets/model/asset-queries";
import { useUploadAssetMutation } from "@/features/assets/model/asset-mutations";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { useCreateRepresentativeImageMutation } from "@/features/photo-registration/representative/model/representative-image-mutations";
import { useRepresentativeImagesQuery } from "@/features/photo-registration/representative/model/representative-image-queries";
import { RepresentativePhotoPreview } from "@/features/photo-registration/representative/ui/representative-photo-preview";
import { RepresentativePhotoUploadField } from "@/features/photo-registration/representative/ui/representative-photo-upload-field";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";

const MIN_REPRESENTATIVE_PHOTO_COUNT = 3;
const MAX_REPRESENTATIVE_PHOTO_COUNT = 10;

type PendingPhoto = { assetId: string; localPreviewUrl: string };

export function RepresentativePhotoHomeScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const representativeImagesQuery = useRepresentativeImagesQuery();
  const uploadAssetMutation = useUploadAssetMutation();
  const createRepresentativeImageMutation =
    useCreateRepresentativeImageMutation();
  const [uploadedPhotos, setUploadedPhotos] = useState<PendingPhoto[]>([]);
  const localPreviewUrls = useRef(new Set<string>());
  const uploadedAssetQueries = useAssetQueries(
    uploadedPhotos.map((photo) => photo.assetId),
  );
  const storeName = statusQuery.data?.storeName ?? "스토어";
  const assetById = new Map(
    uploadedAssetQueries.flatMap((query) =>
      query.data ? [[query.data.id, query.data] as const] : [],
    ),
  );
  const savedPhotos = useMemo(
    () =>
      [...(representativeImagesQuery.data ?? [])]
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map((image) => ({
          assetId: image.assetId,
          isProcessing: !image.deliveryUrl,
          previewUrl: getAssetDeliveryUrl(image.deliveryUrl, image.variants, [
            "THUMBNAIL",
            "MEDIUM",
            "LARGE",
          ]),
        })),
    [representativeImagesQuery.data],
  );
  const savedAssetIds = new Set(
    (representativeImagesQuery.data ?? []).map((image) => image.assetId),
  );
  const pendingPhotos = uploadedPhotos.filter(
    (photo) => !savedAssetIds.has(photo.assetId),
  );
  const previewPhotos = [
    ...savedPhotos,
    ...pendingPhotos.map((photo) => ({
      assetId: photo.assetId,
      isProcessing: assetById.get(photo.assetId)?.status !== "READY",
      previewUrl: photo.localPreviewUrl,
    })),
  ];
  const photoCount = savedAssetIds.size + pendingPhotos.length;
  const canAddPhoto = photoCount < MAX_REPRESENTATIVE_PHOTO_COUNT;
  const hasProcessingPhotos = pendingPhotos.some(
    (photo) => assetById.get(photo.assetId)?.status !== "READY",
  );
  const hasFailedPhoto = pendingPhotos.some(
    (photo) => assetById.get(photo.assetId)?.status === "FAILED",
  );
  const isLoading = representativeImagesQuery.isLoading;
  const isSubmitting =
    uploadAssetMutation.isPending ||
    createRepresentativeImageMutation.isPending;
  const error =
    uploadAssetMutation.error ?? createRepresentativeImageMutation.error;

  useEffect(
    () => () => {
      localPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const revokePreviewUrl = (url: string) => {
    URL.revokeObjectURL(url);
    localPreviewUrls.current.delete(url);
  };

  const handleFileSelect = (file: File) => {
    if (!canAddPhoto) return;

    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewUrls.current.add(localPreviewUrl);
    uploadAssetMutation.mutate(file, {
      onError: () => revokePreviewUrl(localPreviewUrl),
      onSuccess: (uploadedAsset) =>
        setUploadedPhotos((currentPhotos) => [
          ...currentPhotos,
          { assetId: uploadedAsset.assetId, localPreviewUrl },
        ]),
    });
  };

  const handleRegister = async () => {
    await Promise.all(
      pendingPhotos.map((photo, index) =>
        createRepresentativeImageMutation.mutateAsync({
          assetId: photo.assetId,
          sortOrder: savedAssetIds.size + index,
        }),
      ),
    );
    pendingPhotos.forEach((photo) => revokePreviewUrl(photo.localPreviewUrl));
    setUploadedPhotos([]);
    router.push("/seller/photo-registration/gallery");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader backHref="/seller/store-management" title="" />
      <section className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-4">
        <div className="space-y-2">
          <h1 className="text-seller-display-lg font-bold tracking-[-0.84px] whitespace-pre-line">
            {`‘${storeName}’의\n대표사진을 등록해주세요`}
          </h1>
          <p className="text-seller-body-md tracking-[-0.32px] text-text-secondary">
            스토어를 표현할 수 있는 사진들로 등록해보세요
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {previewPhotos.map((photo) => (
            <RepresentativePhotoPreview
              isProcessing={photo.isProcessing}
              key={photo.assetId}
              src={photo.previewUrl}
            />
          ))}
          <RepresentativePhotoUploadField
            disabled={isLoading || isSubmitting || !canAddPhoto}
            onFileSelect={handleFileSelect}
          />
        </div>
        <p className="text-[13px] leading-[18px] tracking-[-0.13px] text-text-secondary">
          * 배경사진은 최소 3개부터 10개까지 등록할 수 있어요
        </p>
        {hasProcessingPhotos ? (
          <p className="text-sm text-text-secondary">
            이미지를 처리 중입니다. 처리 완료 후 대표사진을 등록할 수 있어요.
          </p>
        ) : null}
        {hasFailedPhoto ? (
          <p className="text-sm text-text-error">
            이미지 처리를 완료하지 못했습니다. 사진을 다시 올려주세요.
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {error instanceof Error
              ? error.message
              : "이미지를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        ) : null}
      </section>
      <div className="px-4 pt-4 pb-[34px]">
        <Button
          className="h-[52px] rounded-seller-md text-seller-heading-md font-semibold tracking-[-0.54px]"
          disabled={
            isSubmitting ||
            photoCount < MIN_REPRESENTATIVE_PHOTO_COUNT ||
            hasProcessingPhotos ||
            hasFailedPhoto
          }
          fullWidth
          onClick={handleRegister}
          size="lg"
        >
          대표사진 등록하기
        </Button>
      </div>
    </main>
  );
}
