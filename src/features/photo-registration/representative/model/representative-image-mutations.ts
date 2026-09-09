import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRepresentativeImage,
  deleteRepresentativeImage,
  updateRepresentativeImage,
} from "@/features/photo-registration/representative/api/representative-image-api";
import { representativeImageKeys } from "@/features/photo-registration/representative/model/representative-image-keys";
import { storeKeys } from "@/features/store/model/store-keys";

export function useCreateRepresentativeImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepresentativeImage,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: representativeImageKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: storeKeys.managementStatus(),
        }),
      ]),
  });
}

function invalidateRepresentativeImages(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: representativeImageKeys.all }),
    queryClient.invalidateQueries({ queryKey: storeKeys.managementStatus() }),
  ]);
}

export function useUpdateRepresentativeImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      ...input
    }: { imageId: string } & Parameters<typeof updateRepresentativeImage>[1]) =>
      updateRepresentativeImage(imageId, input),
    onSuccess: () => invalidateRepresentativeImages(queryClient),
  });
}

export function useDeleteRepresentativeImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRepresentativeImage,
    onSuccess: () => invalidateRepresentativeImages(queryClient),
  });
}
