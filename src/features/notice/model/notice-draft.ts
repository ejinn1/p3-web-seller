import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { NoticeType } from "@/features/notice/model/notice-categories";

export type NoticeDraftItem = {
  content: string;
  id: string;
};

export type NoticeDraftState = {
  addItem: (type: NoticeType, content: string) => void;
  ensureInitialItem: (type: NoticeType) => void;
  isInitialized: boolean;
  itemsByType: Partial<Record<NoticeType, NoticeDraftItem[]>>;
  removeItems: (type: NoticeType, itemIds: ReadonlySet<string>) => void;
  replaceDraft: (itemsByType: NoticeDraftState["itemsByType"]) => void;
  setInitialized: () => void;
  updateItem: (type: NoticeType, itemId: string, content: string) => void;
};

export function createNoticeDraftItem(content: string): NoticeDraftItem {
  return { content, id: crypto.randomUUID() };
}

function normalizePersistedItems(
  itemsByType: unknown,
): NoticeDraftState["itemsByType"] {
  if (!itemsByType || typeof itemsByType !== "object") return {};

  return Object.fromEntries(
    Object.entries(itemsByType).map(([type, items]) => [
      type,
      Array.isArray(items)
        ? items.flatMap((item) => {
            if (typeof item === "string") return [createNoticeDraftItem(item)];
            if (
              item &&
              typeof item === "object" &&
              "content" in item &&
              typeof item.content === "string"
            ) {
              return [
                {
                  content: item.content,
                  id:
                    "id" in item && typeof item.id === "string"
                      ? item.id
                      : crypto.randomUUID(),
                },
              ];
            }
            return [];
          })
        : [],
    ]),
  ) as NoticeDraftState["itemsByType"];
}

export const useNoticeDraftStore = create<NoticeDraftState>()(
  persist(
    (set) => ({
      addItem: (type, content) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: [
              ...(state.itemsByType[type] ?? []),
              createNoticeDraftItem(content),
            ],
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
              [type]: [createNoticeDraftItem("")],
            },
          };
        }),
      isInitialized: false,
      itemsByType: {},
      removeItems: (type, itemIds) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: (state.itemsByType[type] ?? []).filter(
              (item) => !itemIds.has(item.id),
            ),
          },
        })),
      replaceDraft: (itemsByType) => set({ itemsByType }),
      setInitialized: () => set({ isInitialized: true }),
      updateItem: (type, itemId, content) =>
        set((state) => ({
          itemsByType: {
            ...state.itemsByType,
            [type]: (state.itemsByType[type] ?? []).map((item) =>
              item.id === itemId ? { ...item, content } : item,
            ),
          },
        })),
    }),
    {
      name: "seller-notice-draft",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          Partial<NoticeDraftState> | undefined;

        return {
          ...currentState,
          ...persisted,
          itemsByType: normalizePersistedItems(persisted?.itemsByType),
        };
      },
      partialize: (state) => ({ itemsByType: state.itemsByType }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
