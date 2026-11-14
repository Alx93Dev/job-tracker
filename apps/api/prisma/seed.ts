import { ApplicationStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
];

async function seed(): Promise<void> {
  await prisma.jobApplication.deleteMany();
  await prisma.jobApplication.createMany({ data: sampleApplications });
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
