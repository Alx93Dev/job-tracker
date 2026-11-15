import { Prisma } from '@prisma/client';
import { AI_INPUT_LIMITS } from '../ai/ai.constants';

export const JOB_APPLICATION_LIMITS = {
  shortTextMaxLength: 120,
  urlMaxLength: 2048,
  notesMaxLength: 5000,
  jobDescriptionMaxLength: AI_INPUT_LIMITS.jobPostingMaxLength,
} as const;

export const FOLLOW_UP_DELAY_DAYS = 7;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const SEARCHABLE_FIELDS = ['companyName', 'positionTitle', 'location'] as const;

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
  jobDescription: true,
  cvMatch: true,
  cvMatchedAt: true,
  followUpAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.JobApplicationSelect;

export const CV_MATCH_ERROR_MESSAGES = {
  missingJobDescription:
    'Add the job description to this application before comparing it with your CV',
  missingCv: 'Add your CV in your profile before comparing it with a job',
} as const;
