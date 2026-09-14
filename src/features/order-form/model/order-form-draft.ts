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
  isDirty: boolean;
  optionsByCategory: Partial<
    Record<OrderFormCategorySlug, OrderFormDraftOption[]>
  >;
  replaceDraft: (
    templateId: string | null,
    optionsByCategory: OrderFormDraftState["optionsByCategory"],
  ) => void;
  resetDraft: () => void;
  removeOptions: (
    category: OrderFormCategorySlug,
    optionIds: ReadonlySet<string>,
  ) => void;
  updateOption: (
    category: OrderFormCategorySlug,
    optionId: string,
    option: OrderFormDraftOption,
  ) => void;
  templateId: string | null;
};

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
      isDirty: false,
      optionsByCategory: {},
      replaceDraft: (templateId, optionsByCategory) =>
        set({ isDirty: false, optionsByCategory, templateId }),
      resetDraft: () =>
        set({ isDirty: false, optionsByCategory: {}, templateId: null }),
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
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2) return persistedState as OrderFormDraftState;

        const state = persistedState as OrderFormDraftState;
        return {
          ...state,
          isDirty: false,
          optionsByCategory: Object.fromEntries(
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
        } as OrderFormDraftState;
      },
    },
  ),
);
