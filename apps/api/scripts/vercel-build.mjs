// Build step for the API project on Vercel.
//
// Production deployments apply pending migrations (never destructive) and refresh the shared
// demo account before compiling. Preview deployments skip the database entirely, so a pull
// request can never change production data.
//
// Migrations use DIRECT_DATABASE_URL when it is set: managed poolers such as Neon's run in
// transaction mode, which Prisma Migrate does not support.
import { execSync } from 'node:child_process';

function run(command, extraEnvironment = {}) {
  execSync(command, { stdio: 'inherit', env: { ...process.env, ...extraEnvironment } });
}

const isProductionDeployment = process.env.VERCEL_ENV === 'production';

if (isProductionDeployment) {
  const migrationDatabaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  run('prisma migrate deploy', { DATABASE_URL: migrationDatabaseUrl });

  if (process.env.DEMO_USER_EMAIL) {
    run('prisma db seed', { DATABASE_URL: migrationDatabaseUrl });
  }
} else {
  console.log(`Skipping migrations and seed for a ${process.env.VERCEL_ENV ?? 'local'} build`);
}

run('nest build');
