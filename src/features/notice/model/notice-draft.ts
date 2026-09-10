import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { NoticeType } from "@/features/notice/model/notice-categories";

export type NoticeDraftState = {
  addItem: (type: NoticeType, content: string) => void;
  ensureInitialItem: (type: NoticeType) => void;
  isInitialized: boolean;
  itemsByType: Partial<Record<NoticeType, string[]>>;
  removeItem: (type: NoticeType, index: number) => void;
  replaceDraft: (itemsByType: NoticeDraftState["itemsByType"]) => void;
  setInitialized: () => void;
  updateItem: (type: NoticeType, index: number, content: string) => void;
};

export const useNoticeDraftStore = create<NoticeDraftState>()(
  persist(
    (set) => ({
      addItem: (type, content) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: [...(state.itemsByType[type] ?? []), content],
          },
        })),
      ensureInitialItem: (type) =>
        set((state) => {
          if ((state.itemsByType[type] ?? []).length > 0) {
            return state;
          }

          return {
            itemsByType: {
              ...state.itemsByType,
              [type]: [""],
            },
          };
        }),
      isInitialized: false,
      itemsByType: {},
      removeItem: (type, index) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: (state.itemsByType[type] ?? []).filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          },
        })),
      replaceDraft: (itemsByType) => set({ itemsByType }),
      setInitialized: () => set({ isInitialized: true }),
      updateItem: (type, index, content) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: (state.itemsByType[type] ?? []).map((item, itemIndex) =>
              itemIndex === index ? content : item,
            ),
          },
        })),
    }),
    {
      name: "seller-notice-draft",
      partialize: (state) => ({ itemsByType: state.itemsByType }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
