import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Prefer the system Chrome: the bundled Playwright chromium revision is
        // not downloaded in every environment (CI images, fresh checkouts), and
        // a missing binary fails the whole suite before the first assertion.
        // Override with PLAYWRIGHT_CHANNEL=chromium when the bundled build is
        // installed instead.
        channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000',
  },
});
