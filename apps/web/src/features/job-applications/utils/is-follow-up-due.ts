import type { ApplicationStatus } from '../types/application-status';
import type { JobApplication } from '../types/job-application';

const FOLLOW_UP_STATUSES: readonly ApplicationStatus[] = ['APPLIED', 'INTERVIEW'];

export function isFollowUpDue(
  jobApplication: Pick<JobApplication, 'status' | 'followUpAt'>,
  now: Date,
): boolean {
  return (
    FOLLOW_UP_STATUSES.includes(jobApplication.status) &&
    jobApplication.followUpAt !== null &&
    new Date(jobApplication.followUpAt) <= now
  );
}
