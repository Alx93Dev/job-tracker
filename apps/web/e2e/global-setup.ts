import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { DEMO_USER_EMAIL, requireE2eDatabaseUrl } from './support/e2e-environment';

const apiDirectory = path.resolve(__dirname, '../../api');

function runPrisma(prismaArguments: string[], databaseUrl: string): void {
  execFileSync('pnpm', ['exec', 'prisma', ...prismaArguments], {
    cwd: apiDirectory,
    env: { ...process.env, DATABASE_URL: databaseUrl, DEMO_USER_EMAIL },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

/**
 * Brings the database up to date without destroying anything: pending migrations are
 * applied and the seed resets only the demo account's applications. Accounts created by
 * the tests use unique emails, so earlier runs do not get in the way.
 */
export default function globalSetup(): void {
  const databaseUrl = requireE2eDatabaseUrl();
  runPrisma(['migrate', 'deploy'], databaseUrl);
  runPrisma(['db', 'seed'], databaseUrl);
}
