import { ApplicationStatus, PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

const DEFAULT_DEMO_USER_EMAIL = 'demo@jobtracker.dev';
const DEMO_USER_NAME = 'Demo';

const sampleApplications = [
  {
    companyName: 'Acme Corp',
    positionTitle: 'Frontend Developer',
    location: 'Remote',
    status: ApplicationStatus.APPLIED,
    appliedAt: new Date('2026-11-03'),
  },
  {
    companyName: 'Globex',
    positionTitle: 'Angular Developer',
    location: 'Madrid',
    salaryRange: '35k - 42k',
    status: ApplicationStatus.INTERVIEW,
    appliedAt: new Date('2026-10-27'),
  },
  {
    companyName: 'Initech',
    positionTitle: 'React Developer',
    location: 'Barcelona (hybrid)',
    status: ApplicationStatus.WISHLIST,
  },
  {
    companyName: 'Umbrella',
    positionTitle: 'UI Engineer',
    location: 'Valencia',
    status: ApplicationStatus.OFFER,
    appliedAt: new Date('2026-10-12'),
  },
  {
    companyName: 'Hooli',
    positionTitle: 'Full-stack Developer',
    location: 'Remote',
    status: ApplicationStatus.REJECTED,
    appliedAt: new Date('2026-10-05'),
  },
];

/**
 * The demo account is only reachable through the "Try the demo" endpoint, so its password
 * is random and never shown. Re-running the seed resets its applications.
 */
async function seed(): Promise<void> {
  const demoUserEmail = process.env.DEMO_USER_EMAIL ?? DEFAULT_DEMO_USER_EMAIL;
  const demoUser = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: {
      email: demoUserEmail,
      name: DEMO_USER_NAME,
      passwordHash: await hash(randomBytes(32).toString('hex')),
    },
    select: { id: true },
  });

  await prisma.jobApplication.deleteMany({ where: { userId: demoUser.id } });
  await prisma.jobApplication.createMany({
    data: sampleApplications.map((application) => ({ ...application, userId: demoUser.id })),
  });
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
