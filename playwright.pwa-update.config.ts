import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  testMatch: 'pwa-update.spec.ts',
  testIgnore: [],
  retries: 0,
  timeout: 120_000,
  outputDir: 'test-results/pwa-update',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/pwa-update' }]],
  use: {
    ...baseConfig.use,
    baseURL: 'http://127.0.0.1:4175',
    trace: { mode: 'retain-on-failure', screenshots: false },
  },
  webServer: {
    command: 'node scripts/pwa-update-server.mjs',
    url: 'http://127.0.0.1:4175/__pwa_test__/status',
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
