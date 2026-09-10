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
  useCreateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  useUpdateGalleryItemMutation,
} from "@/features/photo-registration/gallery/model/gallery-item-mutations";
import { useGalleryItemsQuery } from "@/features/photo-registration/gallery/model/gallery-item-queries";
import { GalleryPhotoDetailSheet } from "@/features/photo-registration/gallery/ui/gallery-photo-detail-sheet";
import { GalleryPhotoPreview } from "@/features/photo-registration/gallery/ui/gallery-photo-preview";
import { GalleryPhotoUploadField } from "@/features/photo-registration/gallery/ui/gallery-photo-upload-field";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";
import { useSortableList } from "@/hooks/use-sortable-list";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

type PendingPhoto = {
  assetId: string;
  featured: boolean;
  localPreviewUrl: string;
  replacingGalleryItemId?: string;
  sortOrder: number;
};

type PreviewPhoto = {
  assetId: string;
  detailUrl?: string;
  featured: boolean;
  galleryItemId?: string;
  id: string;
  isProcessing: boolean;
  previewUrl?: string;
  status?: "VISIBLE" | "HIDDEN";
  storedSortOrder?: number;
  sortOrder: number;
};

export function GalleryRegistrationScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const galleryItemsQuery = useGalleryItemsQuery();
  const uploadAssetMutation = useUploadAssetMutation();
  const createGalleryItemMutation = useCreateGalleryItemMutation();
  const deleteGalleryItemMutation = useDeleteGalleryItemMutation();
  const updateGalleryItemMutation = useUpdateGalleryItemMutation();
  const [uploadedPhotos, setUploadedPhotos] = useState<PendingPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PreviewPhoto | null>(null);
  const [isPhotoDetailSheetOpen, setIsPhotoDetailSheetOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [sortOrderById, setSortOrderById] = useState<Record<string, number>>(
    {},
  );
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
  const replacedGalleryItemIds = useMemo(
    () =>
      new Set(
        uploadedPhotos.flatMap((photo) =>
          photo.replacingGalleryItemId ? [photo.replacingGalleryItemId] : [],
        ),
      ),
    [uploadedPhotos],
  );
  const savedPhotos = useMemo(
    () =>
      (galleryItemsQuery.data ?? [])
        .filter((item) => !replacedGalleryItemIds.has(item.id))
        .map((item) => ({
          assetId: item.assetId,
          detailUrl: getAssetDeliveryUrl(item.deliveryUrl, item.variants, [
            "MEDIUM",
            "LARGE",
            "THUMBNAIL",
          ]),
          featured: item.featured,
          galleryItemId: item.id,
          id: item.id,
          isProcessing: !item.deliveryUrl,
          previewUrl: getAssetDeliveryUrl(item.deliveryUrl, item.variants, [
            "THUMBNAIL",
            "MEDIUM",
            "LARGE",
          ]),
          sortOrder: sortOrderById[item.id] ?? item.sortOrder,
          status: item.status,
          storedSortOrder: item.sortOrder,
        })),
    [galleryItemsQuery.data, replacedGalleryItemIds, sortOrderById],
  );
  const nextSortOrder =
    Math.max(
      -1,
      ...(galleryItemsQuery.data ?? []).map((item) => item.sortOrder),
    ) + 1;
  const pendingPhotos = uploadedPhotos.filter(
    (photo) =>
      !(galleryItemsQuery.data ?? []).some(
        (item) => item.assetId === photo.assetId,
      ),
  );
  const previewPhotos = [
    ...savedPhotos,
    ...pendingPhotos.map((photo) => ({
      assetId: photo.assetId,
      detailUrl: photo.localPreviewUrl,
      featured: photo.featured,
      id: photo.assetId,
      isProcessing: assetById.get(photo.assetId)?.status !== "READY",
      previewUrl: photo.localPreviewUrl,
      sortOrder: sortOrderById[photo.assetId] ?? photo.sortOrder,
    })),
  ].sort((first, second) => first.sortOrder - second.sortOrder);
  const hasProcessingPhotos = pendingPhotos.some(
    (photo) => assetById.get(photo.assetId)?.status !== "READY",
  );
  const hasFailedPhoto = pendingPhotos.some(
    (photo) => assetById.get(photo.assetId)?.status === "FAILED",
  );
  const hasSortChanges = savedPhotos.some(
    (photo) => photo.sortOrder !== photo.storedSortOrder,
  );
  const hasPendingChanges = pendingPhotos.length > 0 || hasSortChanges;
  const isLoading = galleryItemsQuery.isLoading;
  const isSubmitting =
    uploadAssetMutation.isPending ||
    createGalleryItemMutation.isPending ||
    deleteGalleryItemMutation.isPending ||
    updateGalleryItemMutation.isPending;
  const error =
    uploadAssetMutation.error ??
    createGalleryItemMutation.error ??
    deleteGalleryItemMutation.error ??
    updateGalleryItemMutation.error;

  const handleReorder = (reorderedPhotos: PreviewPhoto[]) => {
    setSortOrderById(
      Object.fromEntries(
        reorderedPhotos.map((photo, index) => [photo.id, index]),
      ),
    );
  };
  const { activeId, getSortableItemProps } = useSortableList({
    getId: (photo: PreviewPhoto) => photo.id,
    items: previewPhotos,
    onReorder: handleReorder,
  });

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
            featured: false,
            localPreviewUrl,
            sortOrder: nextSortOrder + currentPhotos.length,
          },
        ]);
      },
    });
  };

  const handleUpdate = async () => {
    const temporarySortOrderStart = previewPhotos.length + nextSortOrder;
    for (const [index, photo] of savedPhotos.entries()) {
      await updateGalleryItemMutation.mutateAsync({
        featured: photo.featured,
        galleryItemId: photo.galleryItemId ?? "",
        sortOrder: temporarySortOrderStart + index,
        status: photo.status ?? "HIDDEN",
      });
    }

    for (const photo of pendingPhotos) {
      if (photo.replacingGalleryItemId) {
        await deleteGalleryItemMutation.mutateAsync(
          photo.replacingGalleryItemId,
        );
      }

      const galleryItem = await createGalleryItemMutation.mutateAsync({
        assetId: photo.assetId,
        featured: photo.featured,
        sortOrder: photo.sortOrder,
      });
      await updateGalleryItemMutation.mutateAsync({
        featured: photo.featured,
        galleryItemId: galleryItem.id,
        sortOrder: photo.sortOrder,
        status: "VISIBLE",
      });
      revokePreviewUrl(photo.localPreviewUrl);
    }

    for (const photo of savedPhotos) {
      await updateGalleryItemMutation.mutateAsync({
        featured: photo.featured,
        galleryItemId: photo.galleryItemId ?? "",
        sortOrder: photo.sortOrder,
        status: photo.status ?? "HIDDEN",
      });
    }

    setUploadedPhotos([]);
    setSortOrderById({});
    router.push(getSellerBackHref("photoRepresentative"));
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    if (selectedPhoto.galleryItemId) {
      await deleteGalleryItemMutation.mutateAsync(selectedPhoto.galleryItemId);
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
    } else if (selectedPhoto.galleryItemId) {
      const validationError = getImageUploadError(file);
      if (validationError) {
        setFileError(validationError);
        setIsPhotoDetailSheetOpen(false);
        return;
      }

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
              featured: selectedPhoto.featured,
              localPreviewUrl,
              replacingGalleryItemId: selectedPhoto.galleryItemId,
              sortOrder: selectedPhoto.sortOrder,
            },
          ]),
      });
    }

    setIsPhotoDetailSheetOpen(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[768px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader backHref={getSellerBackHref("photoGallery")} title="" />
      <section className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-4">
        <div className="space-y-2">
          <h1 className="text-seller-display-lg font-bold tracking-[-0.84px] whitespace-pre-line">
            {`‘${storeName}’의 Best 케이크\n사진을 등록해주세요`}
          </h1>
          <p className="text-seller-body-md tracking-[-0.32px] whitespace-pre-line text-text-secondary">
            {
              "매장의 인기 많은 디자인들을\n구매자들이 바로 주문할 수 있도록 해요"
            }
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {previewPhotos.map((photo) => (
            <GalleryPhotoPreview
              isDragging={activeId === photo.id}
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
              sortableItemProps={getSortableItemProps(photo.id)}
            />
          ))}
          <GalleryPhotoUploadField
            disabled={isLoading || isSubmitting}
            onFileSelect={uploadPhoto}
          />
        </div>
        <p className="text-[13px] leading-[18px] tracking-[-0.13px] text-text-secondary">
          * 사진을 길게 눌러 순서를 바꿀 수 있어요.
        </p>
        {hasProcessingPhotos ? (
          <p className="text-sm text-text-secondary">
            이미지를 처리 중입니다. 처리 완료 후 갤러리를 업데이트할 수 있어요.
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
      </section>
      <div className="flex gap-2 px-4 pt-4 pb-[34px]">
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={() => router.push(getSellerBackHref("photoRepresentative"))}
          size="md"
          variant="outline"
        >
          다음에 하기
        </Button>
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          disabled={
            isSubmitting ||
            !hasPendingChanges ||
            hasProcessingPhotos ||
            hasFailedPhoto
          }
          onClick={handleUpdate}
          size="md"
        >
          갤러리 업데이트
        </Button>
      </div>
      {error ? (
        <p aria-live="polite" className="px-4 pb-4 text-sm text-text-error">
          {error instanceof Error
            ? error.message
            : "갤러리 사진을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."}
        </p>
      ) : null}
      {selectedPhoto?.detailUrl ? (
        <GalleryPhotoDetailSheet
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
