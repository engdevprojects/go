"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between children. */
  stagger?: number;
  /** Seconds before the first child. */
  delay?: number;
  /** Animate when scrolled into view (once) instead of on mount. */
  inView?: boolean;
  /** Element to render; lists should use "ul"/"ol" with StaggerItem as="li". */
  as?: "div" | "ul" | "ol" | "section";
  /** Accessible name when rendered as a list or section. */
  "aria-label"?: string;
}

/**
 * Staggers the entrance of its direct `StaggerItem` children. Animates once —
 * on mount or when first scrolled into view — and never loops. With reduced
 * motion, MotionConfig drops the movement and items simply appear.
 */
export function Stagger({ children, className, stagger = 0.05, delay = 0, inView = false, as = "div", ...aria }: StaggerProps) {
  const Component = motion[as];
  const trigger = inView
    ? { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.15 } }
    : { initial: "hidden", animate: "visible" };
  return (
    <Component className={className} variants={staggerContainer(stagger, delay)} {...trigger} {...aria}>
      {children}
    </Component>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}

/** A child of `Stagger`; fades up with its siblings. */
export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const Component = motion[as];
  return (
    <Component className={className} variants={fadeUp}>
      {children}
    </Component>
  );
}

/**
 * A single block that fades up on mount or when scrolled into view.
 * Use for standalone sections; use Stagger for groups.
 */
export function FadeIn({ children, delay = 0, inView = false, className }: { children: ReactNode; delay?: number; inView?: boolean; className?: string }) {
  const trigger = inView ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } } : { animate: "visible" };
  return (
    <motion.div className={className} initial="hidden" variants={fadeUp} transition={{ delay }} {...trigger}>
      {children}
    </motion.div>
  );
}
