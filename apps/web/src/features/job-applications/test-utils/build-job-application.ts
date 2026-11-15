import type { JobApplication } from '../types/job-application';

const FIXTURE_TIMESTAMP = '2026-11-01T00:00:00.000Z';

export function buildJobApplication(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: 'application-1',
    companyName: 'Acme',
    positionTitle: 'Frontend Developer',
    jobUrl: null,
    location: 'Remote',
    salaryRange: null,
    status: 'WISHLIST',
    appliedAt: null,
    notes: null,
    jobDescription: null,
    cvMatch: null,
    cvMatchedAt: null,
    followUpAt: null,
    createdAt: FIXTURE_TIMESTAMP,
    updatedAt: FIXTURE_TIMESTAMP,
    ...overrides,
  };
}
