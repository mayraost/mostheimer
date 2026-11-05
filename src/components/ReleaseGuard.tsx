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
 * (`/api/health` → `release`, = Next's build id) with the one this tab was
 * loaded with and performs exactly one hard reload when it changed. Cheap: one
 * no-store request on mount, then on tab focus and every 5 minutes.
 */

import { useEffect } from 'react';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'mostheimer.release';

export function ReleaseGuard() {
  useEffect(() => {
    let reloadScheduled = false;

    const check = async () => {
      if (reloadScheduled) return;
      try {
        const response = await fetch('/api/health', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { accept: 'application/json' },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { release?: string | null };
        if (!data.release) return;

        const known = window.sessionStorage.getItem(STORAGE_KEY);
        if (known && known !== data.release) {
          reloadScheduled = true;
          window.location.reload();
          return;
        }
        if (!known) window.sessionStorage.setItem(STORAGE_KEY, data.release);
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
