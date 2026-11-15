export const E2E_PORTS = {
  web: 3000,
  api: 4000,
  mockAnthropic: 4199,
} as const;

export const E2E_URLS = {
  web: `http://localhost:${E2E_PORTS.web}`,
  apiHealth: `http://localhost:${E2E_PORTS.api}/api/health`,
  mockAnthropic: `http://127.0.0.1:${E2E_PORTS.mockAnthropic}`,
} as const;

export const DEMO_USER_EMAIL = 'demo@jobtracker.dev';

/**
 * The suite migrates this database, resets the demo account and creates test users, so it
 * should be a throwaway database. It is read from its own variable on purpose instead of
 * reusing DATABASE_URL.
 */
export function requireE2eDatabaseUrl(): string {
  const databaseUrl = process.env.E2E_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'E2E_DATABASE_URL is not set. Point it at a throwaway PostgreSQL database for the end-to-end suite.',
    );
  }
  return databaseUrl;
}
