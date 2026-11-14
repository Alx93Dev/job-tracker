import type { ApplicationStatus } from './application-status';

export interface JobApplicationPayload {
  companyName: string;
  positionTitle: string;
  jobUrl?: string;
  location?: string;
  salaryRange?: string;
  status: ApplicationStatus;
  appliedAt?: string;
  notes?: string;
}
