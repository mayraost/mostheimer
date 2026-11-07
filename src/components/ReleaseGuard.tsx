'use client';

/**
 * Client-side cache-version guard.
 *
 * The edge cache is purged on every deploy, but an already open tab keeps its
 * client router cache and its old JS chunks — the documented failure mode after
 * a deploy ("works in CI, broken for visitors": new HTML mixed with the
 * previous build's chunks, which Cloudflare serves `immutable` for a year).
 *
 * This guard compares the release id of the running deployment
 * (`/api/health` → `release`, the image's Next BUILD_ID) with the one this tab
 * was loaded with and performs at most one hard reload PER RELEASE.
 *
 * Loop safety (bug found on prod 07.11.2026 — a tab reloaded in a circle right
 * after a redeploy) rests on three independent rules:
 *
 * 1. `release` is a property of the image, never a build timestamp
 *    (`src/lib/release.ts`). Redeploying an unchanged commit keeps the id.
 * 2. The reloaded release is persisted in `localStorage` — the last id this
 *    browser already reloaded for. Seeing the same (or an older) id again
 *    never reloads twice, across tabs and across the reload itself.
 * 3. If storage is unavailable (Safari private mode, ITP, storage disabled),
 *    the guard degrades to read-only: it memorises the id for the lifetime of
 *    the page and NEVER reloads, because it could not remember that it did.
 *
 * Cheap: one no-store request on mount, then on tab focus and every 5 minutes.
 */

import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
/** Last release id this browser already auto-reloaded for (cross-tab). */
const RELOADED_KEY = 'mayraostheimer.release.reloaded';
/**
 * Legacy tab-local key written by the pre-07.11.2026 guard. Never read for the
 * reload decision — only removed so stale ids cannot confuse a future scheme.
 */
const LEGACY_KEYS = ['mostheimer.release'];

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function ReleaseGuard() {
  // A ref, not a closure variable: survives re-runs of the check triggered by
  // focus + visibilitychange firing together.
  const reloadScheduled = useRef(false);

  useEffect(() => {
    for (const legacy of LEGACY_KEYS) {
      try {
        window.sessionStorage.removeItem(legacy);
      } catch {
        // Storage unavailable — nothing to clean up.
      }
    }

    // The id this document was loaded with. Seeded on the first successful
    // check (that is the release whose chunks actually run here) and advanced
    // whenever the server reports a newer one, so a second genuine deploy in
    // the same tab is still detected.
    let loadedWith: string | null = null;
    // Storage is usable only if we can persist the reload marker; without it a
    // reload could repeat forever, so we refuse to reload at all.
    let storageWritable = readStorage(RELOADED_KEY) !== null || writeStorage(RELOADED_KEY, '');

    const check = async () => {
      if (reloadScheduled.current) return;
      try {
        const response = await fetch('/api/health', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { accept: 'application/json' },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { release?: string | null };
        const current = data.release;
        if (!current) return;

        if (loadedWith === null || current === loadedWith) {
          loadedWith = current;
          return;
        }

        // A different release is being served. Reload at most once per id.
        if (readStorage(RELOADED_KEY) === current) {
          // Already bounced for this release (possibly in another tab):
          // adopt the id and stay put instead of reloading in a circle.
          loadedWith = current;
          return;
        }
        if (!storageWritable) {
          // No way to remember that we reloaded — never reload, adopt instead.
          loadedWith = current;
          return;
        }

        // Claim the reload for this release BEFORE navigating. Writing first
        // means a fast reload (or a second tab) cannot claim it again.
        if (!writeStorage(RELOADED_KEY, current)) {
          storageWritable = false;
          loadedWith = current;
          return;
        }

        reloadScheduled.current = true;
        window.location.reload();
      } catch {
        // Offline / origin down: the edge keeps serving; retry on the next run.
      }
    };

    const onFocus = () => void check();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void check();
    };

    void check();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const timer = window.setInterval(() => void check(), POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
