import { readStoredJson, removeStored, writeStoredJson } from "@/lib/browser/storage";
import { createInitialState, DEMO_STORAGE_KEY, parsePersistedState, type PersistedDemoState } from "@/lib/store/persisted-state";

/**
 * Framework-free external store for demo state, consumed through React's
 * `useSyncExternalStore`. The server snapshot is a fixed initial state, so
 * server HTML and the first client render always match; the client snapshot
 * is loaded lazily from localStorage (validated) on first read.
 */

const SERVER_STATE: PersistedDemoState = createInitialState();
const CLOCK_TICK_MS = 30_000;

let current: PersistedDemoState | null = null;
let realNowMs = 0;
const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;

function emit(): void {
  for (const listener of listeners) listener();
}

function load(): PersistedDemoState {
  const result = readStoredJson(DEMO_STORAGE_KEY, parsePersistedState);
  if (result.status === "invalid") removeStored(DEMO_STORAGE_KEY);
  return result.status === "ok" ? result.value : createInitialState();
}

/** Starts the clock tick and cross-tab sync while anything is subscribed. */
function startWatching(): () => void {
  realNowMs = Date.now();
  const interval = window.setInterval(() => {
    realNowMs = Date.now();
    emit();
  }, CLOCK_TICK_MS);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== DEMO_STORAGE_KEY) return;
    current = load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener("storage", onStorage);
  };
}

/** Subscribes to state and clock changes. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) stopWatching = startWatching();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && stopWatching) {
      stopWatching();
      stopWatching = null;
    }
  };
}

/** Client snapshot of persisted demo state. */
export function getSnapshot(): PersistedDemoState {
  if (current === null) current = load();
  return current;
}

/** Server snapshot: always the deterministic initial state. */
export function getServerSnapshot(): PersistedDemoState {
  return SERVER_STATE;
}

/** Client snapshot of the cached real clock (refreshed every 30 s and on every update). */
export function getClockSnapshot(): number {
  if (realNowMs === 0) realNowMs = Date.now();
  return realNowMs;
}

/** Server clock snapshot: 0 means "use the demo epoch". */
export function getServerClockSnapshot(): number {
  return 0;
}

/**
 * Applies an update, persists it, and notifies subscribers.
 * @param updater Pure function from the current state to the next state.
 */
export function updateState(updater: (state: PersistedDemoState) => PersistedDemoState): void {
  current = updater(getSnapshot());
  realNowMs = Date.now();
  writeStoredJson(DEMO_STORAGE_KEY, current);
  emit();
}

let lastSignOutMs = 0;
const SIGN_OUT_GRACE_MS = 5_000;

/**
 * Whether the session ended by an explicit sign-out moments ago, so the route
 * guard can send the visitor home instead of to the sign-in page.
 */
export function signedOutRecently(): boolean {
  return lastSignOutMs !== 0 && Date.now() - lastSignOutMs < SIGN_OUT_GRACE_MS;
}

/** Clears all persisted demo state (sign-out). */
export function resetState(): void {
  lastSignOutMs = Date.now();
  removeStored(DEMO_STORAGE_KEY);
  current = createInitialState();
  realNowMs = Date.now();
  emit();
}
