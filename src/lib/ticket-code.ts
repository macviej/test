const CODE_RE = /IGC-2026-\d{3,}/i;

export function extractParticipantCode(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const match = text.match(CODE_RE);
  if (match) return match[0].toUpperCase();

  try {
    const url = new URL(text);
    const part = url.pathname.split("/").filter(Boolean).pop() || "";
    const fromPath = part.match(CODE_RE);
    if (fromPath) return fromPath[0].toUpperCase();
  } catch {
    // not a URL
  }

  const normalized = text.toUpperCase().replace(/^#/, "");
  if (/^IGC-2026-\d{3,}$/.test(normalized)) return normalized;
  return null;
}
