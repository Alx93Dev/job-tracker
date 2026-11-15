import { ApplicationStatus, PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

const DEFAULT_DEMO_USER_EMAIL = 'demo@jobtracker.dev';
const DEMO_USER_NAME = 'Demo';
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const { WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED } = ApplicationStatus;

interface SampleApplication {
  companyName: string;
  positionTitle: string;
  location: string;
  salaryRange?: string;
  /** Status path with the number of days ago each step happened, oldest first. */
  journey: [ApplicationStatus, number][];
  followUpInDays?: number;
}

const sampleApplications: SampleApplication[] = [
  {
    companyName: 'Initech',
    positionTitle: 'React Developer',
    location: 'Barcelona (hybrid)',
    journey: [[WISHLIST, 2]],
  },
  {
    companyName: 'Stark Industries',
    positionTitle: 'Frontend Engineer',
    location: 'Remote',
    journey: [[WISHLIST, 5]],
  },
  {
    companyName: 'Acme Corp',
    positionTitle: 'Frontend Developer',
    location: 'Remote',
    journey: [
      [WISHLIST, 12],
      [APPLIED, 9],
    ],
    followUpInDays: -2,
  },
  {
    companyName: 'Wayne Enterprises',
    positionTitle: 'Angular Developer',
    location: 'Madrid',
    journey: [[APPLIED, 4]],
    followUpInDays: 3,
  },
  {
    companyName: 'Soylent',
    positionTitle: 'UI Developer',
    location: 'Valencia',
    journey: [[APPLIED, 1]],
    followUpInDays: 6,
  },
  {
    companyName: 'Globex',
    positionTitle: 'Angular Developer',
    location: 'Madrid',
    salaryRange: '35k - 42k',
    journey: [
      [WISHLIST, 30],
      [APPLIED, 27],
      [INTERVIEW, 20],
    ],
    followUpInDays: 2,
  },
  {
    companyName: 'Hooli',
    positionTitle: 'Full-stack Developer',
    location: 'Remote',
    journey: [
      [APPLIED, 40],
      [INTERVIEW, 33],
    ],
    followUpInDays: -1,
  },
  {
    companyName: 'Umbrella',
    positionTitle: 'UI Engineer',
    location: 'Valencia',
    salaryRange: '40k - 46k',
    journey: [
      [APPLIED, 55],
      [INTERVIEW, 47],
      [OFFER, 35],
    ],
  },
  {
    companyName: 'Cyberdyne',
    positionTitle: 'Frontend Developer',
    location: 'Bilbao',
    journey: [
      [APPLIED, 50],
      [REJECTED, 41],
    ],
  },
  {
    companyName: 'Tyrell',
    positionTitle: 'React Developer',
    location: 'Remote',
    journey: [
      [APPLIED, 36],
      [REJECTED, 30],
    ],
  },
  {
    companyName: 'Massive Dynamic',
    positionTitle: 'TypeScript Developer',
    location: 'Madrid',
    journey: [
      [APPLIED, 22],
      [INTERVIEW, 15],
      [REJECTED, 8],
    ],
  },
  {
    companyName: 'Vandelay',
    positionTitle: 'Frontend Developer',
    location: 'Sevilla',
    journey: [[APPLIED, 64]],
  },
];

function daysAgo(days: number, now: Date): Date {
  return new Date(now.getTime() - days * MILLISECONDS_PER_DAY);
}

/**
 * The demo account is only reachable through the "Try the demo" endpoint, so its password
 * is random and never shown. Re-running the seed resets its applications, dated relative
 * to today so the analytics always show recent activity.
 */
async function seed(): Promise<void> {
  const now = new Date();
  const demoUserEmail = process.env.DEMO_USER_EMAIL ?? DEFAULT_DEMO_USER_EMAIL;
  const demoUser = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: { cvText: null, cvUpdatedAt: null },
    create: {
      email: demoUserEmail,
      name: DEMO_USER_NAME,
      passwordHash: await hash(randomBytes(32).toString('hex')),
    },
    select: { id: true },
  });

  await prisma.jobApplication.deleteMany({ where: { userId: demoUser.id } });
  await prisma.notification.deleteMany({ where: { userId: demoUser.id } });

  for (const { journey, followUpInDays, ...details } of sampleApplications) {
    const [currentStatus] = journey[journey.length - 1];
    const appliedStep = journey.find(([status]) => status === APPLIED);
    const createdDaysAgo = journey[0][1];

    await prisma.jobApplication.create({
      data: {
        ...details,
        userId: demoUser.id,
        status: currentStatus,
        appliedAt: appliedStep ? daysAgo(appliedStep[1], now) : null,
        followUpAt: followUpInDays === undefined ? null : daysAgo(-followUpInDays, now),
        createdAt: daysAgo(createdDaysAgo, now),
        statusChanges: {
          create: journey.map(([status, stepDaysAgo], stepIndex) => ({
            fromStatus: stepIndex === 0 ? null : journey[stepIndex - 1][0],
            toStatus: status,
            changedAt: daysAgo(stepDaysAgo, now),
          })),
        },
      },
    });
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
