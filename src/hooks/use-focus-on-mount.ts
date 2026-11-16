"use client";

import { useEffect, useRef } from "react";

/**
 * Moves focus to the returned element when it mounts. Used on the heading of
 * each step in multi-step flows so keyboard and screen-reader users land on
 * the new content instead of a control that no longer exists. The element
 * should have `tabIndex={-1}` so it can take focus without entering the tab order.
 */
export function useFocusOnMount<Element extends HTMLElement>() {
  const ref = useRef<Element>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: false });
  }, []);
  return ref;
}
