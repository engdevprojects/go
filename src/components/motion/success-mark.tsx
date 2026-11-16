"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { TRANSITION } from "@/lib/motion";

/**
 * Animated confirmation mark for completed demo actions: the circle settles
 * in and the tick draws once. Decorative — the surrounding text states the
 * outcome. Static with reduced motion.
 */
export function SuccessMark({ tone = "success", className }: { tone?: "success" | "danger"; className?: string }) {
  const reduce = useReducedMotion();
  const color = tone === "success" ? "text-success" : "text-danger";
  return (
    <motion.svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("size-12", color, className)}
      initial={reduce ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={TRANSITION.base}
    >
      <circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.12" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <motion.path
        d={tone === "success" ? "M15 24.5l6 6 12-13" : "M17 17l14 14M31 17L17 31"}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
