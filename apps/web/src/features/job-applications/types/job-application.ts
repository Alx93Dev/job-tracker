import type { CvMatch } from '@/features/ai/types/cv-match';
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
  jobDescription: string | null;
  cvMatch: CvMatch | null;
  cvMatchedAt: string | null;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}
