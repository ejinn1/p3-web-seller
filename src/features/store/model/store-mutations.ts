import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStore,
  deleteStore,
  updateStoreBusinessHours,
  updateStoreDescription,
  updateStoreRefundPolicy,
  updateStoreSettings,
  updateStoreStatus,
  updateSellerProfileImage,
} from "@/features/store/api/store-api";
import { authKeys } from "@/features/auth/api/auth-keys";
import { storeKeys } from "@/features/store/model/store-keys";

export function useCreateStoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStoreBusinessHoursMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreBusinessHours,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStoreDescriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreDescription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStoreRefundPolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreRefundPolicy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStoreStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useDeleteStoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => queryClient.removeQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateSellerProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSellerProfileImage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authKeys.all }),
        queryClient.invalidateQueries({ queryKey: storeKeys.all }),
      ]);
    },
  });
}

export function useUpdateStoreSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storeKeys.settings() }),
  });
}
