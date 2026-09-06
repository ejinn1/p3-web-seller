import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGalleryItem,
  deleteGalleryItem,
  updateGalleryItem,
} from "@/features/photo-registration/gallery/api/gallery-item-api";
import { galleryItemKeys } from "@/features/photo-registration/gallery/model/gallery-item-keys";
import { storeKeys } from "@/features/store/model/store-keys";

export function useCreateGalleryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: galleryItemKeys.all }),
        queryClient.invalidateQueries({
          queryKey: storeKeys.managementStatus(),
        }),
      ]),
  });
}

export function useDeleteGalleryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: galleryItemKeys.all }),
        queryClient.invalidateQueries({
          queryKey: storeKeys.managementStatus(),
        }),
      ]),
  });
}

export function useUpdateGalleryItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryItemId,
      ...input
    }: { galleryItemId: string } & Parameters<typeof updateGalleryItem>[1]) =>
      updateGalleryItem(galleryItemId, input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: galleryItemKeys.all }),
        queryClient.invalidateQueries({
          queryKey: storeKeys.managementStatus(),
        }),
      ]),
  });
}
