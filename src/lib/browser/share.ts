/** What happened when the visitor asked to share. */
export type ShareOutcome = "shared" | "copied" | "cancelled" | "unavailable";

/**
 * Shares text with the Web Share API when available, otherwise copies it to
 * the clipboard. Both APIs can reject (permission denied, insecure context,
 * user cancel), so each path is handled explicitly.
 *
 * @param data Title and text to share. The text should already be safe to share.
 */
export async function shareOrCopy(data: { title: string; text: string }): Promise<ShareOutcome> {
  if (typeof navigator === "undefined") return "unavailable";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Fall through to clipboard (e.g. NotAllowedError in an iframe).
    }
  }

  return copyText(`${data.title}\n${data.text}`);
}

/**
 * Copies text to the clipboard.
 * @returns "copied" on success, "unavailable" if the Clipboard API is missing or refused.
 */
export async function copyText(text: string): Promise<"copied" | "unavailable"> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return "unavailable";
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "unavailable";
  }
}
