"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/button";
import { getAssetDeliveryUrl } from "@/features/assets/model/asset-delivery";
import { useAssetQueries } from "@/features/assets/model/asset-queries";
import { useUploadAssetMutation } from "@/features/assets/model/asset-mutations";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import { getImageUploadError } from "@/features/assets/model/image-upload";
import {
  useCreateRepresentativeImageMutation,
  useDeleteRepresentativeImageMutation,
  useUpdateRepresentativeImageMutation,
} from "@/features/photo-registration/representative/model/representative-image-mutations";
import { useRepresentativeImagesQuery } from "@/features/photo-registration/representative/model/representative-image-queries";
import { RepresentativePhotoPreview } from "@/features/photo-registration/representative/ui/representative-photo-preview";
import { RepresentativePhotoUploadField } from "@/features/photo-registration/representative/ui/representative-photo-upload-field";
import { PhotoDetailSheet } from "@/features/photo-registration/ui/photo-detail-sheet";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

const MIN_REPRESENTATIVE_PHOTO_COUNT = 3;
const MAX_REPRESENTATIVE_PHOTO_COUNT = 10;

type PendingPhoto = {
  assetId: string;
  localPreviewUrl: string;
  replacingImageId?: string;
  sortOrder: number;
};

type PreviewPhoto = {
  assetId: string;
  detailUrl?: string;
  imageId?: string;
  isProcessing: boolean;
  previewUrl?: string;
  sortOrder: number;
};

export function RepresentativePhotoHomeScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const representativeImagesQuery = useRepresentativeImagesQuery();
  const uploadAssetMutation = useUploadAssetMutation();
  const createRepresentativeImageMutation =
    useCreateRepresentativeImageMutation();
  const updateRepresentativeImageMutation =
    useUpdateRepresentativeImageMutation();
  const deleteRepresentativeImageMutation =
    useDeleteRepresentativeImageMutation();
  const [uploadedPhotos, setUploadedPhotos] = useState<PendingPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PreviewPhoto | null>(null);
  const [isPhotoDetailSheetOpen, setIsPhotoDetailSheetOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
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
  const replacedImageIds = useMemo(
    () =>
      new Set(
        uploadedPhotos.flatMap((photo) =>
          photo.replacingImageId ? [photo.replacingImageId] : [],
        ),
      ),
    [uploadedPhotos],
  );
  const savedPhotos = useMemo(
    () =>
      [...(representativeImagesQuery.data ?? [])]
        .filter((image) => !replacedImageIds.has(image.id))
        .sort((first, second) => first.sortOrder - second.sortOrder)
        .map((image) => ({
          assetId: image.assetId,
          detailUrl: getAssetDeliveryUrl(image.deliveryUrl, image.variants, [
            "MEDIUM",
            "LARGE",
            "THUMBNAIL",
          ]),
          imageId: image.id,
          isProcessing: !image.deliveryUrl,
          previewUrl: getAssetDeliveryUrl(image.deliveryUrl, image.variants, [
            "THUMBNAIL",
            "MEDIUM",
            "LARGE",
          ]),
          sortOrder: image.sortOrder,
        })),
    [representativeImagesQuery.data, replacedImageIds],
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
      detailUrl: photo.localPreviewUrl,
      isProcessing: assetById.get(photo.assetId)?.status !== "READY",
      previewUrl: photo.localPreviewUrl,
      sortOrder: photo.sortOrder,
    })),
  ].sort((first, second) => first.sortOrder - second.sortOrder);
  const photoCount = savedPhotos.length + pendingPhotos.length;
  const nextSortOrder =
    Math.max(
      -1,
      ...(representativeImagesQuery.data ?? []).map((image) => image.sortOrder),
    ) + 1;
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
    createRepresentativeImageMutation.isPending ||
    updateRepresentativeImageMutation.isPending ||
    deleteRepresentativeImageMutation.isPending;
  const error =
    uploadAssetMutation.error ??
    createRepresentativeImageMutation.error ??
    updateRepresentativeImageMutation.error ??
    deleteRepresentativeImageMutation.error;

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

  const uploadPhoto = (file: File, replacement?: PendingPhoto) => {
    if (!canAddPhoto && !replacement) return;

    const validationError = getImageUploadError(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);
    const localPreviewUrl = URL.createObjectURL(file);
    localPreviewUrls.current.add(localPreviewUrl);
    uploadAssetMutation.mutate(file, {
      onError: () => revokePreviewUrl(localPreviewUrl),
      onSuccess: (uploadedAsset) => {
        if (replacement) {
          revokePreviewUrl(replacement.localPreviewUrl);
          setUploadedPhotos((currentPhotos) =>
            currentPhotos.map((photo) =>
              photo.assetId === replacement.assetId
                ? {
                    ...photo,
                    assetId: uploadedAsset.assetId,
                    localPreviewUrl,
                  }
                : photo,
            ),
          );
          return;
        }

        setUploadedPhotos((currentPhotos) => [
          ...currentPhotos,
          {
            assetId: uploadedAsset.assetId,
            localPreviewUrl,
            sortOrder: nextSortOrder + currentPhotos.length,
          },
        ]);
      },
    });
  };

  const handleRegister = async () => {
    try {
      const replacements = pendingPhotos.filter(
        (photo) => photo.replacingImageId,
      );
      const additions = pendingPhotos.filter(
        (photo) => !photo.replacingImageId,
      );
      const savedPhotoCount = representativeImagesQuery.data?.length ?? 0;
      let temporarySortOrder = nextSortOrder;

      for (const photo of replacements) {
        const replacingImageId = photo.replacingImageId!;

        if (savedPhotoCount >= MAX_REPRESENTATIVE_PHOTO_COUNT) {
          await deleteRepresentativeImageMutation.mutateAsync(replacingImageId);
          await createRepresentativeImageMutation.mutateAsync({
            assetId: photo.assetId,
            sortOrder: photo.sortOrder,
          });
          continue;
        }

        const createdImage =
          await createRepresentativeImageMutation.mutateAsync({
            assetId: photo.assetId,
            sortOrder: temporarySortOrder++,
          });
        await deleteRepresentativeImageMutation.mutateAsync(replacingImageId);
        await updateRepresentativeImageMutation.mutateAsync({
          imageId: createdImage.id,
          sortOrder: photo.sortOrder,
          status: "ACTIVE",
        });
      }

      for (const photo of additions) {
        await createRepresentativeImageMutation.mutateAsync({
          assetId: photo.assetId,
          sortOrder: photo.sortOrder,
        });
      }

      pendingPhotos.forEach((photo) => revokePreviewUrl(photo.localPreviewUrl));
      setUploadedPhotos([]);
    } catch {
      // The mutation state is rendered on the current screen.
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    if (selectedPhoto.imageId) {
      try {
        await deleteRepresentativeImageMutation.mutateAsync(
          selectedPhoto.imageId,
        );
      } catch {
        return;
      }
    } else {
      const pendingPhoto = uploadedPhotos.find(
        (photo) => photo.assetId === selectedPhoto.assetId,
      );
      if (pendingPhoto) revokePreviewUrl(pendingPhoto.localPreviewUrl);
      setUploadedPhotos((currentPhotos) =>
        currentPhotos.filter(
          (photo) => photo.assetId !== selectedPhoto.assetId,
        ),
      );
    }

    setIsPhotoDetailSheetOpen(false);
  };

  const handleReplace = (file: File) => {
    if (!selectedPhoto) return;

    const pendingPhoto = uploadedPhotos.find(
      (photo) => photo.assetId === selectedPhoto.assetId,
    );
    if (pendingPhoto) {
      uploadPhoto(file, pendingPhoto);
      setIsPhotoDetailSheetOpen(false);
      return;
    }

    const validationError = getImageUploadError(file);
    if (validationError) {
      setFileError(validationError);
      setIsPhotoDetailSheetOpen(false);
      return;
    }

    if (selectedPhoto.imageId) {
      const replacingImageId = selectedPhoto.imageId;
      const replacementSortOrder = selectedPhoto.sortOrder;
      setFileError(null);
      const localPreviewUrl = URL.createObjectURL(file);
      localPreviewUrls.current.add(localPreviewUrl);
      uploadAssetMutation.mutate(file, {
        onError: () => revokePreviewUrl(localPreviewUrl),
        onSuccess: (uploadedAsset) =>
          setUploadedPhotos((currentPhotos) => [
            ...currentPhotos,
            {
              assetId: uploadedAsset.assetId,
              localPreviewUrl,
              replacingImageId,
              sortOrder: replacementSortOrder,
            },
          ]),
      });
    }

    setIsPhotoDetailSheetOpen(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader
        backHref={getSellerBackHref("photoRepresentative")}
        title=""
      />
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
              onClick={
                photo.detailUrl
                  ? () => {
                      setSelectedPhoto(photo);
                      setIsPhotoDetailSheetOpen(true);
                    }
                  : undefined
              }
              src={photo.previewUrl}
            />
          ))}
          <RepresentativePhotoUploadField
            disabled={isLoading || isSubmitting || !canAddPhoto}
            onFileSelect={uploadPhoto}
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
        {fileError ? (
          <p aria-live="polite" className="text-sm text-text-error">
            {fileError}
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
      <div className="flex gap-2 px-4 pt-4 pb-[34px]">
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={() => router.push("/seller/photo-registration/gallery")}
          size="md"
          variant="outline"
        >
          갤러리 등록하기
        </Button>
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          disabled={
            isSubmitting ||
            pendingPhotos.length === 0 ||
            photoCount < MIN_REPRESENTATIVE_PHOTO_COUNT ||
            hasProcessingPhotos ||
            hasFailedPhoto
          }
          onClick={handleRegister}
          size="md"
        >
          대표사진 등록하기
        </Button>
      </div>
      {selectedPhoto?.detailUrl ? (
        <PhotoDetailSheet
          alt="선택한 대표사진 상세 보기"
          isSubmitting={isSubmitting}
          onClose={() => setIsPhotoDetailSheetOpen(false)}
          onDelete={handleDelete}
          onReplace={handleReplace}
          open={isPhotoDetailSheetOpen}
          src={selectedPhoto.detailUrl}
        />
      ) : null}
    </main>
  );
}
