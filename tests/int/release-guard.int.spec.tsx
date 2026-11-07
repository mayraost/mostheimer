import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { ReleaseGuard } from '@/components/ReleaseGuard';

/**
 * Regression contract for the reload loop reported on prod 07.11.2026: an open
 * tab reloaded in a circle right after a redeploy.
 *
 * Root cause was two independent defects — both are pinned here so neither can
 * come back silently:
 *
 * 1. `release` used to be `build-${Date.now()}`, so every build of an unchanged
 *    commit was a "new release". Loop safety now also relies on the guard
 *    itself, which must survive a release id that keeps changing.
 * 2. The guard reloaded whenever `sessionStorage` did not hold the id — and it
 *    only wrote the key when it was absent, so a storage that cannot be written
 *    (Safari private mode, ITP, quota) reloaded on every focus event.
 *
 * No DB, no network: `fetch` and `window.location.reload` are stubbed.
 */

const RELOADED_KEY = 'mayraostheimer.release.reloaded';
const LEGACY_KEYS = ['mostheimer.release'];

type HealthBody = { status: string; release: string | null };

let reloadCalls = 0;
let currentRelease: string | null = 'BUILD_A';

function installFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      const body: HealthBody = { status: 'ok', release: currentRelease };
      return {
        ok: true,
        json: async () => body,
      } as unknown as Response;
    }),
  );
}

function installStorage(options: { writable: boolean }) {
  const map = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      if (!options.writable) throw new DOMException('denied', 'QuotaExceededError');
      map.set(key, value);
    },
  };

  Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
  Object.defineProperty(window, 'sessionStorage', { configurable: true, value: storage });

  return map;
}

/** Simulate a tab focus, which is one of the trigger paths. */
function focusTab() {
  window.dispatchEvent(new Event('focus'));
}

beforeEach(() => {
  reloadCalls = 0;
  currentRelease = 'BUILD_A';
  // jsdom's `location.reload` is not configurable, so replace `location`
  // wholesale. The guard only touches `reload`, everything else is inert here.
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      reload: () => {
        reloadCalls += 1;
      },
    },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ReleaseGuard — no reload loop', () => {
  it('does not reload while the release is stable', async () => {
    installStorage({ writable: true });
    installFetch();

    render(<ReleaseGuard />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    focusTab();
    focusTab();
    await Promise.resolve();

    expect(reloadCalls).toBe(0);
  });

  it('reloads exactly once for a new release, even across repeat checks', async () => {
    installStorage({ writable: true });
    installFetch();

    render(<ReleaseGuard />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    currentRelease = 'BUILD_B';
    focusTab();

    await waitFor(() => expect(reloadCalls).toBe(1));

    // Every further focus sees the same new id: must NOT reload again.
    focusTab();
    focusTab();
    await Promise.resolve();
    expect(reloadCalls).toBe(1);
  });

  it('never reloads a second time for a release it already reloaded for', async () => {
    const store = installStorage({ writable: true });
    installFetch();

    store.set(RELOADED_KEY, 'BUILD_B');
    currentRelease = 'BUILD_B';

    render(<ReleaseGuard />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    focusTab();
    await Promise.resolve();

    expect(reloadCalls).toBe(0);
  });

  it('does not reload when storage is unavailable (the original loop trigger)', async () => {
    installStorage({ writable: false });
    installFetch();

    render(<ReleaseGuard />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    // A changing id is exactly the scenario that used to loop forever.
    for (const release of ['BUILD_B', 'BUILD_C', 'BUILD_D']) {
      currentRelease = release;
      focusTab();
      await Promise.resolve();
    }

    expect(reloadCalls).toBe(0);
  });

  it('ignores a null release instead of treating it as a change', async () => {
    installStorage({ writable: true });
    installFetch();

    render(<ReleaseGuard />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    currentRelease = null;
    focusTab();
    await Promise.resolve();
    expect(reloadCalls).toBe(0);

    currentRelease = 'BUILD_A';
    focusTab();
    await Promise.resolve();
    expect(reloadCalls).toBe(0);
  });

  it('clears the legacy session key', async () => {
    const store = installStorage({ writable: true });
    for (const key of LEGACY_KEYS) store.set(key, 'stale');

    installFetch();
    render(<ReleaseGuard />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    for (const key of LEGACY_KEYS) expect(store.has(key)).toBe(false);
  });

  /**
   * The user-visible bug, end to end: a *new* build on every page load (the
   * old `build-${Date.now()}` id) must not reload forever. Against the previous
   * implementation this reloads on every single page load after the first.
   */
  it('terminates across page loads when every build has a new id', async () => {
    installStorage({ writable: true });
    installFetch();

    for (let page = 0; page < 4; page += 1) {
      currentRelease = `build-${1_700_000_000_000 + page}`;
      render(<ReleaseGuard />);
      await waitFor(() => expect(fetch).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 20));
      cleanup();
    }

    // One real change may bounce once; a changing id forever must not.
    expect(reloadCalls).toBeLessThanOrEqual(1);
  });
});
