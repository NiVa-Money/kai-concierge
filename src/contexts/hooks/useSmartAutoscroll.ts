/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

type Options = {
  /** Values that, when changed, indicate new content (e.g., [messageCount, isTyping]) */
  observe?: any[];
  /** Pixel tolerance from the bottom to still count as "at bottom" */
  tolerance?: number;
  /** Behavior on first load (when resetKey changes): 'auto' | 'smooth' | 'none' */
  firstLoadBehavior?: "auto" | "smooth" | "none";
  /** Change this (e.g., sessionId) to reset the hook between sessions/views */
  resetKey?: any;
};

export default function useSmartAutoscroll(options: Options = {}) {
  const {
    observe = [],
    tolerance = 64,
    firstLoadBehavior = "auto",
    resetKey,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const [autoScroll, setAutoScroll] = useState(true); // follow new items?
  const [isAtBottom, setIsAtBottom] = useState(true); // for UI affordances
  const [hasNewItems, setHasNewItems] = useState(false); // show CTA when paused
  const firstLoadRef = useRef(true);

  const jumpToBottom = (behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
    setHasNewItems(false);
  };

  // Reset on "view change" (e.g., new session)
  useEffect(() => {
    firstLoadRef.current = true;
    setAutoScroll(true);
    setHasNewItems(false);
  }, [resetKey]);

  // Track scrolling to decide whether to autoscroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom <= tolerance;

      setIsAtBottom(atBottom);
      setAutoScroll(atBottom);
      if (atBottom) setHasNewItems(false);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    // initialize once
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [tolerance, resetKey]);

  // Respond to new content (messages/typing)
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      if (firstLoadBehavior !== "none") {
        jumpToBottom(firstLoadBehavior as ScrollBehavior);
      }
      return;
    }

    if (autoScroll) {
      jumpToBottom("smooth");
    } else {
      setHasNewItems(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, observe);

  return {
    containerRef,
    endRef,
    autoScroll,
    isAtBottom,
    hasNewItems,
    jumpToBottom,
    setHasNewItems, // exposed in case you want to manually hide the CTA
  };
}
