import type { ApplicationStatus } from './application-status';

export interface JobApplicationFilters {
  status?: ApplicationStatus;
  search?: string;
}
