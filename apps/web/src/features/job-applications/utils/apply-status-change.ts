import type { ApplicationStatus } from '../types/application-status';
import type { JobApplication } from '../types/job-application';
import type { JobApplicationFilters } from '../types/job-application-filters';

export interface StatusChange {
  id: string;
  status: ApplicationStatus;
}

export function applyStatusChange(
  jobApplications: JobApplication[],
  { id, status }: StatusChange,
  filters: JobApplicationFilters,
  changedAt: string,
): JobApplication[] {
  const updatedApplications = jobApplications.map((jobApplication) =>
    jobApplication.id === id ? { ...jobApplication, status, updatedAt: changedAt } : jobApplication,
  );

  return filters.status
    ? updatedApplications.filter((jobApplication) => jobApplication.status === filters.status)
    : updatedApplications;
}
