"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const LONG_PRESS_DELAY = 250;
const MOVE_THRESHOLD = 8;

export type SortableItemProps = {
  "aria-grabbed": boolean;
  "data-sortable-item-id": string;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
};

type UseSortableListOptions<T> = {
  getId: (item: T) => string;
  items: T[];
  onReorder: (items: T[]) => void;
};

export function useSortableList<T>({
  getId,
  items,
  onReorder,
}: UseSortableListOptions<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const didDragRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onReorderRef.current = onReorder;
  }, [onReorder]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      clearHoldTimer();
      pointerStartRef.current = null;

      if (activeIdRef.current) {
        event.currentTarget.releasePointerCapture(event.pointerId);
        activeIdRef.current = null;
        setActiveId(null);
        window.setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }
    },
    [clearHoldTimer],
  );

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  const getSortableItemProps = useCallback(
    (id: string): SortableItemProps => ({
      "aria-grabbed": activeId === id,
      "data-sortable-item-id": id,
      onClickCapture: (event) => {
        if (!didDragRef.current) return;

        event.preventDefault();
        event.stopPropagation();
      },
      onPointerCancel: finishDrag,
      onPointerDown: (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        const currentTarget = event.currentTarget;
        const pointerId = event.pointerId;
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        didDragRef.current = false;
        clearHoldTimer();

        if (event.pointerType === "mouse") {
          activeIdRef.current = id;
          currentTarget.setPointerCapture(pointerId);
          setActiveId(id);
          return;
        }

        holdTimerRef.current = setTimeout(() => {
          activeIdRef.current = id;
          didDragRef.current = true;
          currentTarget.setPointerCapture(pointerId);
          setActiveId(id);
        }, LONG_PRESS_DELAY);
      },
      onPointerMove: (event) => {
        const pointerStart = pointerStartRef.current;
        if (!activeIdRef.current && pointerStart) {
          const movedDistance = Math.hypot(
            event.clientX - pointerStart.x,
            event.clientY - pointerStart.y,
          );
          if (movedDistance > MOVE_THRESHOLD) clearHoldTimer();
          return;
        }

        if (activeIdRef.current !== id) return;

        if (!didDragRef.current && pointerStart) {
          const movedDistance = Math.hypot(
            event.clientX - pointerStart.x,
            event.clientY - pointerStart.y,
          );
          if (movedDistance <= MOVE_THRESHOLD) return;
          didDragRef.current = true;
        }

        const targetElement = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLElement>("[data-sortable-item-id]");
        const targetId = targetElement?.dataset.sortableItemId;
        if (!targetId || targetId === id) return;

        const currentItems = itemsRef.current;
        const sourceIndex = currentItems.findIndex(
          (item) => getId(item) === id,
        );
        const targetIndex = currentItems.findIndex(
          (item) => getId(item) === targetId,
        );
        if (sourceIndex < 0 || targetIndex < 0) return;

        const reorderedItems = [...currentItems];
        const [sourceItem] = reorderedItems.splice(sourceIndex, 1);
        reorderedItems.splice(targetIndex, 0, sourceItem);
        onReorderRef.current(reorderedItems);
      },
      onPointerUp: finishDrag,
    }),
    [activeId, clearHoldTimer, finishDrag, getId],
  );

  return { activeId, getSortableItemProps };
}
