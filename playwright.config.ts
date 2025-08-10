import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: 0,
  use: { headless: true, baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
