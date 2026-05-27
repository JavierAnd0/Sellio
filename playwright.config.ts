import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: 'pnpm --filter @sellio/web dev',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'pnpm --filter @sellio/cards dev',
          url: process.env.PLAYWRIGHT_CARDS_URL ?? 'http://127.0.0.1:3001',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
