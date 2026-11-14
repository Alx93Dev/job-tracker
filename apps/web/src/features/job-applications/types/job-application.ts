import type { ApplicationStatus } from './application-status';

export interface JobApplication {
  id: string;
  companyName: string;
  positionTitle: string;
  jobUrl: string | null;
  location: string | null;
  salaryRange: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
