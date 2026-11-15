import type { ApplicationStatus } from './application-status';

export interface JobApplicationPayload {
  companyName: string;
  positionTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  followUpAt?: string | null;
  notes?: string | null;
  jobDescription?: string | null;
}
