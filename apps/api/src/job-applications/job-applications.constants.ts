import { Prisma } from '@prisma/client';

export const JOB_APPLICATION_LIMITS = {
  shortTextMaxLength: 120,
  urlMaxLength: 2048,
  notesMaxLength: 5000,
} as const;

export const PRISMA_RECORD_NOT_FOUND_CODE = 'P2025';

export const jobApplicationResponseSelect = {
  id: true,
  companyName: true,
  positionTitle: true,
  jobUrl: true,
  location: true,
  salaryRange: true,
  status: true,
  appliedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.JobApplicationSelect;
