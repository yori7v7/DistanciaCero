import { defineConfig, devices } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  retries: 0,
  outputDir: 'test-results/cross-browser',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/cross-browser' }]],
  use: {
    ...baseConfig.use,
    baseURL: 'http://127.0.0.1:5174',
    trace: { mode: 'retain-on-failure', screenshots: false },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_BASE: '/', VITE_REMOTE_CONTENT_ENABLED: 'false' },
  },
  projects: [
    { name: 'webkit', use: { ...devices['Desktop Safari'], deviceScaleFactor: 1 } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
