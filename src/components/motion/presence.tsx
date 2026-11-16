"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, TRANSITION } from "@/lib/motion";

interface SwitchTransitionProps {
  /** Changing this key swaps the content with an exit-then-enter transition. */
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Cross-transitions between steps or views (exit first, then enter) so only
 * one step is ever in the DOM. Skips the animation on first render.
 */
export function SwitchTransition({ id, children, className }: SwitchTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={id} className={className} variants={fadeUp} initial="hidden" animate="visible" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface CollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Smoothly expands and collapses optional content (alerts, extra fields,
 * breakdowns) instead of letting it pop in and shift the layout abruptly.
 * Content is removed from the DOM when closed.
 */
export function Collapse({ open, children, className }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="collapse"
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: TRANSITION.base }}
          exit={{ height: 0, opacity: 0, transition: TRANSITION.exit }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
