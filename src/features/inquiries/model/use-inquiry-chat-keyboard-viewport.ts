"use client";

import { useEffect, useRef, useState } from "react";

const COMPOSER_INPUT_SELECTOR = '[data-qa="chat-composer"] input';

export function useInquiryChatKeyboardViewport() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const root = document.documentElement;
    const body = document.body;
    const initialScrollX = window.scrollX;
    const initialScrollY = window.scrollY;
    const previousRootStyles = {
      height: root.style.height,
      overflow: root.style.overflow,
      overscrollBehavior: root.style.overscrollBehavior,
    };
    const previousBodyStyles = {
      height: body.style.height,
      inset: body.style.inset,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      position: body.style.position,
      width: body.style.width,
    };
    let frameId = 0;

    root.style.height = "100%";
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.height = "100%";
    body.style.inset = "0";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.width = "100%";
    window.scrollTo(0, 0);

    const updateStageHeight = () => {
      const parent = stage.parentElement;
      if (!parent) return;

      const stageTop = stage.getBoundingClientRect().top;
      const parentBottom = parent.getBoundingClientRect().bottom;
      const visualViewport = window.visualViewport;
      const visibleBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : window.innerHeight;
      const nextHeight = Math.max(
        0,
        Math.min(parentBottom, visibleBottom) - stageTop,
      );
      const height = `${Math.round(nextHeight)}px`;

      stage.style.flex = `0 0 ${height}`;
      stage.style.height = height;
    };

    const scheduleStageHeightUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateStageHeight);
    };

    const updateComposerFocus = () => {
      setIsComposerFocused(
        document.activeElement?.matches(COMPOSER_INPUT_SELECTOR) ?? false,
      );
      scheduleStageHeightUpdate();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;

      if (
        !(target instanceof Element) ||
        !target.matches(COMPOSER_INPUT_SELECTOR)
      ) {
        return;
      }

      setIsComposerFocused(true);
      scheduleStageHeightUpdate();
    };

    const handleFocusOut = () => {
      window.requestAnimationFrame(updateComposerFocus);
    };

    updateStageHeight();
    updateComposerFocus();
    window.visualViewport?.addEventListener(
      "resize",
      scheduleStageHeightUpdate,
    );
    window.visualViewport?.addEventListener(
      "scroll",
      scheduleStageHeightUpdate,
    );
    window.addEventListener("resize", scheduleStageHeightUpdate);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleStageHeightUpdate,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        scheduleStageHeightUpdate,
      );
      window.removeEventListener("resize", scheduleStageHeightUpdate);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      root.style.height = previousRootStyles.height;
      root.style.overflow = previousRootStyles.overflow;
      root.style.overscrollBehavior = previousRootStyles.overscrollBehavior;
      body.style.height = previousBodyStyles.height;
      body.style.inset = previousBodyStyles.inset;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      body.style.position = previousBodyStyles.position;
      body.style.width = previousBodyStyles.width;
      window.scrollTo(initialScrollX, initialScrollY);
    };
  }, []);

  return { isComposerFocused, stageRef };
}
