/**
 * Accepts only same-site paths for post-sign-in redirects ("/wallet"), and
 * rejects protocol-relative or absolute URLs ("//evil.example", "https://…").
 * @param value Raw `next` query value.
 * @param fallback Path used when the value is missing or unsafe.
 */
export function safeInternalPath(value: string | string[] | undefined | null, fallback = "/dashboard"): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;
  return candidate;
}
