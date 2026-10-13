/**
 * Back-navigation detection for scroll restoration.
 *
 * Next.js App Router `<Link>` navigations use `pushState` (no `popstate`
 * event), while the browser back/forward buttons DO fire `popstate` — but
 * they fire *before* the newly-mounted page components run their effects,
 * and some components legitimately mount/re-run more than once per
 * navigation. A consumed-once flag therefore misses legitimate observers.
 *
 * So the marker is intentionally NEVER consumed by observers: it auto-expires
 * after a short window, is cleared once the scroll owner (SmoothScroller)
 * finishes restoring, and is cleared on every forward navigation (which never
 * sets it). Observers only ever peek.
 */

const KEY = 'realvilla:back-nav';
// Max age for a back-navigation marker to still be considered valid.
const WINDOW_MS = 5000;

// Same-realm mirror so freshly remounted components (which run their effects
// after popstate fired) still observe the navigation.
let lastBackNavAt = 0;

export function markBackNavigation(): void {
  lastBackNavAt = Date.now();
  try {
    sessionStorage.setItem(KEY, String(lastBackNavAt));
  } catch {
    /* storage unavailable — back detection simply skipped */
  }
}

function isFresh(ts: number): boolean {
  return Number.isFinite(ts) && ts > 0 && Date.now() - ts < WINDOW_MS;
}

/**
 * True if a browser back/forward navigation happened very recently.
 * Read-only: safe to call from any number of components/effects.
 */
export function peekBackNavigation(): boolean {
  if (isFresh(lastBackNavAt)) return true;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw && isFresh(Number(raw))) {
      lastBackNavAt = Number(raw); // re-mirror for subsequent peeks
      return true;
    }
  } catch {
    /* storage unavailable */
  }
  return false;
}

/** Clears the marker (after a restore, or on forward navigations). */
export function clearBackNavigation(): void {
  lastBackNavAt = 0;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
