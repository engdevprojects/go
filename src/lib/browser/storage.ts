/**
 * Minimal, defensive localStorage adapter.
 *
 * Storage can be missing (SSR), blocked (privacy mode), full, or hold corrupt
 * JSON. Every access is wrapped so callers get a typed result instead of an
 * exception. Never store secrets, OTPs, PINs or card data through this.
 */

/** Outcome of reading a stored value. */
export type StorageReadResult<T> =
  | { status: "ok"; value: T }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "unavailable" };

/** Returns `window.localStorage`, or null when it can't be used. */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads and validates a JSON value.
 * @param key Storage key (use a versioned key, e.g. "rvw.demo.v1").
 * @param parse Validator that returns the typed value or null if invalid.
 */
export function readStoredJson<T>(key: string, parse: (value: unknown) => T | null): StorageReadResult<T> {
  const storage = getStorage();
  if (!storage) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "missing" };
  try {
    const value = parse(JSON.parse(raw));
    return value === null ? { status: "invalid" } : { status: "ok", value };
  } catch {
    return { status: "invalid" };
  }
}

/**
 * Writes a JSON value. Returns false if storage is unavailable or full; the
 * demo keeps working in memory in that case.
 */
export function writeStoredJson(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Demo state could not be saved to this browser.", error instanceof Error ? error.name : "UnknownError");
    return false;
  }
}

/** Removes a stored value, ignoring unavailable storage. */
export function removeStored(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Storage blocked: nothing persisted, so nothing to remove.
  }
}
