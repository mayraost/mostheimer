import { expect, test, type Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/**
 * Admin credentials for the smoke tests. The users collection rejects public
 * sign-up (`403`), so the user must be provided by the environment — typically
 * a local seed. Without credentials the suite skips instead of failing, which
 * keeps `npm test` green on a fresh checkout while still guarding the panel
 * wherever a login is available.
 */
const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? '',
  password: process.env.E2E_ADMIN_PASSWORD ?? '',
  name: 'Test',
};

const hasCredentials = Boolean(ADMIN.email && ADMIN.password);

async function login(page: Page): Promise<void> {
  await page.goto(`${BASE}/admin/login`);
  await page.fill('#field-email', ADMIN.email);
  await page.fill('#field-password', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin`);
}

test.describe('Admin Panel', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    test.skip(!hasCredentials, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD not set');
    const context = await browser.newContext();
    page = await context.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await page?.context().close();
  });
  test('can navigate to dashboard', async () => {
    // Payload 4 renders the dashboard as TEXT in the grouped nav/breadcrumb
    // (measured: `body` contains "Dashboard", but neither a `link "Dashboard"`
    // nor a `span[title="Dashboard"]` exists any more). Asserting on visible
    // text keeps the smoke test stable across admin markup changes.
    await expect(page.getByText('Dashboard', { exact: true }).first()).toBeVisible();
  });

  test('can navigate to list view', async () => {
    await page.goto(`${BASE}/admin/collections/users`);
    await expect(page).toHaveURL(`${BASE}/admin/collections/users`);
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first();
    await expect(listViewArtifact).toBeVisible();
  });

  test('can navigate to edit view', async () => {
    await page.goto(`${BASE}/admin/collections/users/create`);
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/);
    const editViewArtifact = page.locator('input[name="email"]');
    await expect(editViewArtifact).toBeVisible();
  });
});
