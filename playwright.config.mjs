import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'playwright-login.mjs',
  use: {
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
