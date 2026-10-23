import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4183', headless: true },
  webServer: {
    command: 'python server.py',
    url: 'http://127.0.0.1:4183/api/health',
    reuseExistingServer: true
  }
});
