/**
 * Normalizes a social/external URL entered in Sanity Studio.
 * Prepends https:// when no scheme is present so `href` never resolves as a
 * relative site path. Returns '#' when empty (preserves existing fallback).
 */
export function normalizeExternalUrl(link?: string | null): string {
  const clean = (link || '').trim();
  if (!clean) return '#';
  if (/^(https?:\/\/|mailto:|tel:|wa\.me\/)/i.test(clean)) {
    // wa.me links without scheme still need https://
    if (/^wa\.me\//i.test(clean)) return `https://${clean}`;
    return clean;
  }
  return `https://${clean}`;
}
