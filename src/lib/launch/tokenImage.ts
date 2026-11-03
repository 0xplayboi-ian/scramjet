/**
 * Token metadata must point at a durable https image.
 * Local object URLs and the unresolved scramjet.tools host are rejected.
 */
export function requireTokenImageUrl(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.startsWith("blob:")) {
    throw new Error(
      "Token image must be an https URL. A local preview cannot be written on chain."
    );
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Token image must be an https URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Token image must be an https URL.");
  }

  const host = url.hostname.toLowerCase();
  if (host === "scramjet.tools" || host.endsWith(".scramjet.tools")) {
    throw new Error("That image host does not resolve. Paste a durable https image URL.");
  }

  return url.toString();
}
