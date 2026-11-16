"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { DemoStoreProvider } from "@/lib/store/demo-store";

/**
 * Client providers for the whole app. `reducedMotion="user"` makes every
 * motion animation honour the OS "reduce motion" setting.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStoreProvider>
        <ToastProvider>{children}</ToastProvider>
      </DemoStoreProvider>
    </MotionConfig>
  );
}
