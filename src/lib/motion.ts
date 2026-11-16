import type { Transition, Variants } from "motion/react";

/**
 * Shared motion configuration. Every animated component reads durations,
 * easings and variants from here so motion feels consistent and can be tuned
 * in one place. Values mirror the CSS tokens in globals.css
 * (--duration-fast/base/slow, --ease-standard).
 *
 * Reduced motion: <MotionConfig reducedMotion="user"> (Providers) removes
 * transform/layout animation app-wide when the OS asks for it; components
 * that animate numbers or SVG paths also check useReducedMotion().
 */

/** Durations in seconds. Kept short so navigation never feels slow. */
export const DURATION = { fast: 0.15, base: 0.22, slow: 0.35, count: 0.7 } as const;

/** Standard deceleration curve (matches --ease-standard). */
export const EASE_STANDARD: [number, number, number, number] = [0.2, 0, 0, 1];
/** Accelerating curve for exits. */
export const EASE_EXIT: [number, number, number, number] = [0.4, 0, 1, 1];

export const TRANSITION = {
  base: { duration: DURATION.base, ease: EASE_STANDARD } satisfies Transition,
  slow: { duration: DURATION.slow, ease: EASE_STANDARD } satisfies Transition,
  exit: { duration: DURATION.fast, ease: EASE_EXIT } satisfies Transition,
  /** Snappy spring for indicators that slide between options. */
  indicator: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 } satisfies Transition,
} as const;

/** Small upward fade used for entrances (8 px keeps it subtle). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: TRANSITION.base },
  exit: { opacity: 0, y: -4, transition: TRANSITION.exit },
};

/** Opacity-only fade for content swaps where movement would distract. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION.base },
  exit: { opacity: 0, transition: TRANSITION.exit },
};

/**
 * Container variant that staggers its children's `fadeUp`.
 * @param stagger Delay between children in seconds.
 * @param delayChildren Delay before the first child.
 */
export function staggerContainer(stagger = 0.05, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/** Maximum items to stagger; anything after appears with the last group so long lists never feel slow. */
export const MAX_STAGGERED_ITEMS = 8;
