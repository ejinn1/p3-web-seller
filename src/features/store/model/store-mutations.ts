import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStore,
  completeAccountRegistration,
  deleteStore,
  updateStore,
  updateStoreBusinessHours,
  updateStoreDescription,
  updateStoreRefundPolicy,
  updateStoreSettings,
  updateStoreStatus,
} from "@/features/store/api/store-api";
import { storeKeys } from "@/features/store/model/store-keys";

export function useCreateStoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStore,
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

export function useCompleteAccountRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeAccountRegistration,
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

export function useUpdateStoreSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storeKeys.settings() }),
  });
}
