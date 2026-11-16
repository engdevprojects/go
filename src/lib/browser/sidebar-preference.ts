"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStoredJson, writeStoredJson } from "@/lib/browser/storage";

/**
 * Remembers whether the desktop sidebar is collapsed. A per-viewer UI
 * convenience only — not demo data — so it lives under its own key and
 * survives sign-out. Storage failures fall back to "expanded".
 */

const STORAGE_KEY = "go.ui.sidebar-collapsed";
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function read(): boolean {
  const result = readStoredJson(STORAGE_KEY, (value) => (typeof value === "boolean" ? value : null));
  return result.status === "ok" ? result.value : false;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY) return;
  cached = read();
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): boolean {
  if (cached === null) cached = read();
  return cached;
}

/** The server always renders the expanded sidebar. */
const getServerSnapshot = () => false;

/**
 * Collapsed state of the desktop sidebar and a setter that persists it.
 * @returns `[collapsed, setCollapsed]`
 */
export function useSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setCollapsed = useCallback((next: boolean) => {
    cached = next;
    writeStoredJson(STORAGE_KEY, next);
    emit();
  }, []);
  return [collapsed, setCollapsed];
}
