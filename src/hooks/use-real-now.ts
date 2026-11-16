"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared one-second ticker. All countdowns (OTP expiry, resend cooldown,
 * quote lock) read the same cached time, so there's one interval no matter
 * how many components use it, and render stays pure.
 */

let cachedNow = 0;
let interval: number | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (interval === null) {
    cachedNow = Date.now();
    interval = window.setInterval(() => {
      cachedNow = Date.now();
      for (const notify of listeners) notify();
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval !== null) {
      window.clearInterval(interval);
      interval = null;
    }
  };
}

function getSnapshot(): number {
  if (cachedNow === 0) cachedNow = Date.now();
  return cachedNow;
}

const getServerSnapshot = () => 0;

/**
 * Returns the real current time in ms, refreshed every second.
 * Returns 0 during server rendering — treat 0 as "unknown".
 */
export function useRealNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Seconds remaining until `deadlineMs`, never negative.
 * @param deadlineMs Absolute deadline in real ms.
 * @param nowMs Current real time from `useRealNow`.
 */
export function secondsLeft(deadlineMs: number, nowMs: number): number {
  if (nowMs === 0) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

/** Formats seconds as m:ss. */
export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
