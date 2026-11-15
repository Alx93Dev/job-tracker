import { defineConfig, devices } from '@playwright/test';
import {
  DEMO_USER_EMAIL,
  E2E_PORTS,
  E2E_URLS,
  requireE2eDatabaseUrl,
} from './e2e/support/e2e-environment';

const isCi = Boolean(process.env.CI);
const databaseUrl = requireE2eDatabaseUrl();
const SERVER_START_TIMEOUT_MS = 120_000;
const RELAXED_RATE_LIMIT = '10000';

/**
 * Runs the production builds of both apps (`pnpm build` first) against a throwaway
 * database and a local stand-in for the Claude API. Tests share the seeded demo account,
 * so they run one at a time.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: isCi ? 1 : 0,
  forbidOnly: isCi,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: E2E_URLS.web,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `node e2e/support/mock-anthropic.mjs ${E2E_PORTS.mockAnthropic}`,
      url: E2E_URLS.mockAnthropic,
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter api start:prod',
      url: E2E_URLS.apiHealth,
      reuseExistingServer: false,
      timeout: SERVER_START_TIMEOUT_MS,
      env: {
        DATABASE_URL: databaseUrl,
        PORT: String(E2E_PORTS.api),
        CORS_ORIGIN: E2E_URLS.web,
        JWT_ACCESS_SECRET: 'e2e-only-secret-that-is-long-enough-to-pass-validation',
        COOKIE_SECURE: 'false',
        DEMO_USER_EMAIL,
        ANTHROPIC_API_KEY: 'e2e-mock-key',
        ANTHROPIC_BASE_URL: E2E_URLS.mockAnthropic,
        GLOBAL_RATE_LIMIT_PER_MINUTE: RELAXED_RATE_LIMIT,
        AUTH_RATE_LIMIT_PER_MINUTE: RELAXED_RATE_LIMIT,
        AI_RATE_LIMIT_PER_MINUTE: RELAXED_RATE_LIMIT,
      },
    },
    {
      command: `pnpm exec next start --port ${E2E_PORTS.web}`,
      url: `${E2E_URLS.web}/login`,
      reuseExistingServer: false,
      timeout: SERVER_START_TIMEOUT_MS,
    },
  ],
});
