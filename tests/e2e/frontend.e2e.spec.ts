import { expect, test } from '@playwright/test';

/**
 * 404 contract of the site (Proxy decides the status, page renders the UI).
 *
 * No Payload import here on purpose: the test process must not load
 * `src/payload.config.ts` (that pulls `next/cache`, which only resolves inside
 * the Next bundler — `NODE_OPTIONS=--import=tsx/esm` in the test script fails on
 * it). Everything goes through HTTP against the running server.
 *
 * The slugs the positive cases touch (`/de`, `/en`) come from the CMS content
 * stored in the local/Prod database; a slug that does not exist must never
 * appear in the database, so a clearly synthetic path is used for the negative
 * cases.
 */
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/** A path that cannot be a CMS slug (uuid-ish, no page ever uses it). */
const UNKNOWN_DE = '/de/zzz-e2e-unknown-slug';
const UNKNOWN_EN = '/en/zzz-e2e-unknown-slug';

test.describe('404 handling', () => {
  test('unknown slug answers a real 404 with the localized page', async ({ page }) => {
    const response = await page.goto(BASE + UNKNOWN_DE);

    expect(response?.status()).toBe(404);

    // Localized content from `[locale]/[[...slug]]/not-found.tsx` — not the
    // global English fallback.
    await expect(page.locator('body')).toContainText('Seite nicht gefunden');
    // Chrome from the app shell is present (header + footer, no error document).
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('english unknown slug answers 404 in english', async ({ page }) => {
    const response = await page.goto(BASE + UNKNOWN_EN);

    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText('Page not found');
  });

  test('deep unknown path answers 404', async ({ page }) => {
    const response = await page.goto(BASE + UNKNOWN_DE + '/nested/deeper');

    expect(response?.status()).toBe(404);
  });

  test('known routes keep status 200', async ({ page }) => {
    for (const path of ['/de', '/en']) {
      const response = await page.goto(BASE + path);
      expect(response?.status(), path).toBe(200);
    }
  });
});
