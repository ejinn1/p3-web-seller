"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAssetDeliveryUrl } from "@/features/assets/model/asset-delivery";
import { useUploadAssetMutation } from "@/features/assets/model/asset-mutations";
import type { UploadedAsset } from "@/features/assets/model/asset-types";
import { OrderFormHeader } from "@/features/order-form/ui/order-form-header";
import {
  useCreateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} from "@/features/photo-registration/gallery/model/gallery-item-mutations";
import { useGalleryItemsQuery } from "@/features/photo-registration/gallery/model/gallery-item-queries";
import { GalleryPhotoDetailSheet } from "@/features/photo-registration/gallery/ui/gallery-photo-detail-sheet";
import { GalleryPhotoPreview } from "@/features/photo-registration/gallery/ui/gallery-photo-preview";
import { GalleryPhotoUploadField } from "@/features/photo-registration/gallery/ui/gallery-photo-upload-field";
import { useStoreManagementStatusQuery } from "@/features/store/model/store-queries";

type PreviewPhoto = {
  assetId: string;
  deliveryUrl: string;
  featured: boolean;
  galleryItemId: string | undefined;
  sortOrder: number;
};

type SavedPreviewPhoto = PreviewPhoto & { galleryItemId: string };
type PendingPreviewPhoto = PreviewPhoto & { galleryItemId: undefined };

export function GalleryRegistrationScreen() {
  const router = useRouter();
  const statusQuery = useStoreManagementStatusQuery();
  const galleryItemsQuery = useGalleryItemsQuery();
  const uploadAssetMutation = useUploadAssetMutation();
  const createGalleryItemMutation = useCreateGalleryItemMutation();
  const deleteGalleryItemMutation = useDeleteGalleryItemMutation();
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedAsset[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PreviewPhoto | null>(null);
  const [isPhotoDetailSheetOpen, setIsPhotoDetailSheetOpen] = useState(false);
  const storeName = statusQuery.data?.storeName ?? "스토어";
  const savedPhotos = useMemo(() => {
    return [...(galleryItemsQuery.data ?? [])]
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((galleryItem) => {
        const deliveryUrl = getAssetDeliveryUrl(
          galleryItem.variants,
          galleryItem.deliveryUrl,
        );

        return deliveryUrl
          ? {
              assetId: galleryItem.assetId,
              deliveryUrl,
              featured: galleryItem.featured,
              galleryItemId: galleryItem.id,
              sortOrder: galleryItem.sortOrder,
            }
          : null;
      })
      .filter((photo): photo is SavedPreviewPhoto => photo !== null);
  }, [galleryItemsQuery.data]);
  const savedAssetIds = new Set(
    (galleryItemsQuery.data ?? []).map((galleryItem) => galleryItem.assetId),
  );
  const pendingPhotos = uploadedPhotos.filter(
    (photo) => !savedAssetIds.has(photo.assetId),
  );
  const previewPhotos = [
    ...savedPhotos,
    ...pendingPhotos
      .map((photo, index) =>
        photo.deliveryUrl
          ? {
              assetId: photo.assetId,
              deliveryUrl: photo.deliveryUrl,
              featured: false,
              galleryItemId: undefined,
              sortOrder: (galleryItemsQuery.data?.length ?? 0) + index,
            }
          : null,
      )
      .filter((photo): photo is PendingPreviewPhoto => photo !== null),
  ];

  const handleFileSelect = (file: File) => {
    uploadAssetMutation.mutate(file, {
      onSuccess: (uploadedAsset) =>
        setUploadedPhotos((currentPhotos) => [...currentPhotos, uploadedAsset]),
    });
  };

  const handleUpdate = async () => {
    await Promise.all(
      pendingPhotos.map((photo, index) =>
        createGalleryItemMutation.mutateAsync({
          assetId: photo.assetId,
          featured: false,
          sortOrder: (galleryItemsQuery.data?.length ?? 0) + index,
        }),
      ),
    );
    setUploadedPhotos([]);
    router.push("/seller/store-management");
  };
  const isLoading = galleryItemsQuery.isLoading;
  const isSubmitting =
    uploadAssetMutation.isPending ||
    createGalleryItemMutation.isPending ||
    deleteGalleryItemMutation.isPending;
  const error =
    uploadAssetMutation.error ??
    createGalleryItemMutation.error ??
    deleteGalleryItemMutation.error;

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    if (selectedPhoto.galleryItemId) {
      await deleteGalleryItemMutation.mutateAsync(selectedPhoto.galleryItemId);
    } else {
      setUploadedPhotos((currentPhotos) =>
        currentPhotos.filter(
          (photo) => photo.assetId !== selectedPhoto.assetId,
        ),
      );
    }

    setIsPhotoDetailSheetOpen(false);
  };

  const handleReplace = (file: File) => {
    const photoToReplace = selectedPhoto;
    if (!photoToReplace) return;

    uploadAssetMutation.mutate(file, {
      onSuccess: async (uploadedAsset) => {
        if (photoToReplace.galleryItemId) {
          await deleteGalleryItemMutation.mutateAsync(
            photoToReplace.galleryItemId,
          );
          await createGalleryItemMutation.mutateAsync({
            assetId: uploadedAsset.assetId,
            featured: photoToReplace.featured,
            sortOrder: photoToReplace.sortOrder,
          });
        } else {
          setUploadedPhotos((currentPhotos) =>
            currentPhotos.map((photo) =>
              photo.assetId === photoToReplace.assetId ? uploadedAsset : photo,
            ),
          );
        }

        setIsPhotoDetailSheetOpen(false);
      },
    });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-surface-default text-text-primary">
      <OrderFormHeader
        backHref="/seller/photo-registration/representative"
        title=""
      />
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
              key={photo.assetId}
              onClick={() => {
                setSelectedPhoto(photo);
                setIsPhotoDetailSheetOpen(true);
              }}
              src={photo.deliveryUrl}
            />
          ))}
          <GalleryPhotoUploadField
            disabled={isLoading || isSubmitting}
            onFileSelect={handleFileSelect}
          />
        </div>
        <p className="text-[13px] leading-[18px] tracking-[-0.13px] text-text-secondary">
          * 사진을 길게 눌러 순서를 바꿀 수 있어요.
        </p>
      </section>
      <div className="flex gap-2 px-4 pt-4 pb-[34px]">
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          onClick={() => router.push("/seller/store-management")}
          size="md"
          variant="outline"
        >
          다음에 하기
        </Button>
        <Button
          className="h-11 flex-1 rounded-seller-md text-[15px] font-semibold"
          disabled={isSubmitting || pendingPhotos.length === 0}
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
      {selectedPhoto ? (
        <GalleryPhotoDetailSheet
          isSubmitting={isSubmitting}
          onClose={() => setIsPhotoDetailSheetOpen(false)}
          onDelete={handleDelete}
          onReplace={handleReplace}
          open={isPhotoDetailSheetOpen}
          src={selectedPhoto.deliveryUrl}
        />
      ) : null}
    </main>
  );
}
