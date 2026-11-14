import { APPLICATION_STATUSES, type ApplicationStatus } from '../types/application-status';
import type { JobApplication } from '../types/job-application';

export function groupByStatus(
  jobApplications: JobApplication[],
): Record<ApplicationStatus, JobApplication[]> {
  const emptyColumns = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, [] as JobApplication[]]),
  ) as Record<ApplicationStatus, JobApplication[]>;

  return jobApplications.reduce((columns, jobApplication) => {
    columns[jobApplication.status].push(jobApplication);
    return columns;
  }, emptyColumns);
}
