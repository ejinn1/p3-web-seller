import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OrderFormCategorySlug } from "@/features/order-form/model/order-form-categories";

export type OrderFormDraftOptionType =
  "SELECT" | "SELECT_WITH_TEXT" | "IMAGE" | "TEXTAREA";

export type OrderFormDraftOption = {
  description: string;
  example: string;
  label: string;
  price: string;
  type: OrderFormDraftOptionType;
};

type OrderFormDraftState = {
  addOption: (
    category: OrderFormCategorySlug,
    option: OrderFormDraftOption,
  ) => void;
  optionsByCategory: Partial<
    Record<OrderFormCategorySlug, OrderFormDraftOption[]>
  >;
  replaceDraft: (
    templateId: string | null,
    optionsByCategory: OrderFormDraftState["optionsByCategory"],
  ) => void;
  resetDraft: () => void;
  removeOption: (category: OrderFormCategorySlug, index: number) => void;
  updateOption: (
    category: OrderFormCategorySlug,
    index: number,
    option: OrderFormDraftOption,
  ) => void;
  templateId: string | null;
};

export const useOrderFormDraftStore = create<OrderFormDraftState>()(
  persist(
    (set) => ({
      addOption: (category, option) =>
        set((state) => ({
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: [...(state.optionsByCategory[category] ?? []), option],
          },
        })),
      optionsByCategory: {},
      replaceDraft: (templateId, optionsByCategory) =>
        set({ optionsByCategory, templateId }),
      resetDraft: () => set({ optionsByCategory: {}, templateId: null }),
      removeOption: (category, index) =>
        set((state) => ({
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: (state.optionsByCategory[category] ?? []).filter(
              (_, optionIndex) => optionIndex !== index,
            ),
          },
        })),
      updateOption: (category, index, option) =>
        set((state) => ({
          optionsByCategory: {
            ...state.optionsByCategory,
            [category]: (state.optionsByCategory[category] ?? []).map(
              (currentOption, optionIndex) =>
                optionIndex === index ? option : currentOption,
            ),
          },
        })),
      templateId: null,
    }),
    {
      name: "seller-order-form-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
