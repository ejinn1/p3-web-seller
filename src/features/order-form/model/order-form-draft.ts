import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OrderFormCategorySlug } from "@/features/order-form/model/order-form-categories";

export type OrderFormDraftOptionType =
  "SELECT" | "SELECT_WITH_TEXT" | "IMAGE" | "TEXTAREA";
export type OrderFormDraftPriceMode = "FIXED" | "INQUIRY";

export type OrderFormDraftOption = {
  description: string;
  example: string;
  id: string;
  label: string;
  price: string;
  priceMode: OrderFormDraftPriceMode;
  type: OrderFormDraftOptionType;
};

type OrderFormDraftState = {
  addOption: (
    category: OrderFormCategorySlug,
    option: OrderFormDraftOption,
  ) => void;
  draftStoreId: string | null;
  initializeDraft: (
    storeId: string,
    templateId: string | null,
    optionsByCategory: OrderFormDraftState["optionsByCategory"],
  ) => void;
  isHydrated: boolean;
  isDirty: boolean;
  optionsByCategory: Partial<
    Record<OrderFormCategorySlug, OrderFormDraftOption[]>
  >;
  resetDraft: () => void;
  removeOptions: (
    category: OrderFormCategorySlug,
    optionIds: ReadonlySet<string>,
  ) => void;
  setHydrated: () => void;
  updateOption: (
    category: OrderFormCategorySlug,
    optionId: string,
    option: OrderFormDraftOption,
  ) => void;
  templateId: string | null;
};

type PersistedOrderFormDraftState = Pick<
  OrderFormDraftState,
  "draftStoreId" | "isDirty" | "optionsByCategory" | "templateId"
>;

export const useOrderFormDraftStore = create<OrderFormDraftState>()(
  persist(
    (set) => ({
      addOption: (category, option) =>
        set((state) => ({
          isDirty: true,
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: [...(state.optionsByCategory[category] ?? []), option],
          },
        })),
      draftStoreId: null,
      initializeDraft: (storeId, templateId, optionsByCategory) =>
        set((state) => {
          if (
            state.isDirty &&
            state.draftStoreId === storeId &&
            state.templateId === templateId
          ) {
            return state;
          }

          return {
            draftStoreId: storeId,
            isDirty: false,
            optionsByCategory,
            templateId,
          };
        }),
      isHydrated: false,
      isDirty: false,
      optionsByCategory: {},
      resetDraft: () =>
        set({
          draftStoreId: null,
          isDirty: false,
          optionsByCategory: {},
          templateId: null,
        }),
      removeOptions: (category, optionIds) =>
        set((state) => ({
          isDirty: true,
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: (state.optionsByCategory[category] ?? []).filter(
              (option) => !optionIds.has(option.id),
            ),
          },
        })),
      setHydrated: () => set({ isHydrated: true }),
      updateOption: (category, optionId, option) =>
        set((state) => ({
          isDirty: true,
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: (state.optionsByCategory[category] ?? []).map(
              (currentOption) =>
                currentOption.id === optionId ? option : currentOption,
            ),
          },
        })),
      templateId: null,
    }),
    {
      name: "seller-order-form-draft",
      storage: createJSONStorage(() => sessionStorage),
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as PersistedOrderFormDraftState;
        if (version >= 3) return state;

        return {
          ...state,
          draftStoreId: null,
          isDirty: false,
          optionsByCategory:
            version >= 1
              ? state.optionsByCategory
              : Object.fromEntries(
                  Object.entries(state.optionsByCategory ?? {}).map(
                    ([category, options]) => [
                      category,
                      options?.map((option) => ({
                        ...option,
                        id: option.id || crypto.randomUUID(),
                        priceMode:
                          option.type === "IMAGE" &&
                          !/^\d+$/.test(option.price.replace(/,/g, ""))
                            ? "INQUIRY"
                            : "FIXED",
                      })),
                    ],
                  ),
                ),
        } satisfies PersistedOrderFormDraftState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        draftStoreId: state.draftStoreId,
        isDirty: state.isDirty,
        optionsByCategory: state.optionsByCategory,
        templateId: state.templateId,
      }),
    },
  ),
);
