/**
 * Date helpers. All display uses Africa/Kigali time so server and client render
 * identical strings, and the demo is anchored to a fixed "now" during the pilot
 * period so seeded data, countdowns, and analytics stay deterministic.
 */

export const KIGALI_TIME_ZONE = "Africa/Kigali";

/** The demo's fixed starting instant: 11 April 2027, 10:00 Kigali time. */
export const DEMO_EPOCH_ISO = "2027-04-11T08:00:00.000Z";

const MS_PER_DAY = 86_400_000;

/**
 * Returns the demo clock: the epoch plus however long this demo session has
 * been running in real time. Without a session start (or on the server) it
 * returns the epoch, keeping server and client renders identical.
 * @param sessionStartedAtMs Real `Date.now()` captured at demo sign-in.
 * @param realNowMs Current real time; 0 means "not known yet" (server render).
 */
export function demoNow(sessionStartedAtMs: number | null, realNowMs: number): Date {
  const epoch = Date.parse(DEMO_EPOCH_ISO);
  if (!sessionStartedAtMs || realNowMs === 0) return new Date(epoch);
  return new Date(epoch + Math.max(0, realNowMs - sessionStartedAtMs));
}

/**
 * Reads the real clock. For event handlers and async flows only — render code
 * must use the store's demo clock or `useRealNow` so output stays pure.
 */
export function readRealClock(): number {
  return Date.now();
}

/**
 * Demo time for the moment an event happens (e.g. when a quote is requested).
 * @param sessionStartedAtMs Session start from the demo store.
 */
export function demoNowForEvent(sessionStartedAtMs: number | null): Date {
  return demoNow(sessionStartedAtMs, readRealClock());
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: KIGALI_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: KIGALI_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: KIGALI_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: KIGALI_TIME_ZONE,
  day: "numeric",
  month: "short",
});
const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: KIGALI_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "11 Apr 2027" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "10:42" (24-hour, Kigali). */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** "11 Apr 2027, 10:42" */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/** "11 Apr" — compact chart and table labels. */
export function formatShortDay(iso: string): string {
  return shortDayFormatter.format(new Date(iso));
}

/** "Sunday 11 April" — used for transaction date-group headings. */
export function formatWeekday(iso: string): string {
  return weekdayFormatter.format(new Date(iso));
}

/**
 * Calendar-day key in Kigali time ("2027-04-11"), used for grouping and charts.
 */
export function kigaliDayKey(date: Date | string): string {
  return keyFormatter.format(typeof date === "string" ? new Date(date) : date);
}

/**
 * Short relative time, e.g. "Just now", "5 min ago", "3 h ago", "2 days ago".
 * Falls back to the absolute date after a week.
 */
export function formatRelative(iso: string, now: Date): string {
  const seconds = Math.round((now.getTime() - Date.parse(iso)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h ago`;
  const days = Math.floor(seconds / 86_400);
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`;
  return formatDate(iso);
}

/**
 * Returns the Kigali day keys for the `count` days ending on `end` (inclusive).
 */
export function lastDayKeys(end: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => kigaliDayKey(new Date(end.getTime() - (count - 1 - index) * MS_PER_DAY)));
}

/**
 * Returns the time-of-day greeting for a Kigali-time instant.
 */
export function greetingFor(now: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: KIGALI_TIME_ZONE, hour: "numeric", hour12: false }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
