import type { JobApplication } from '../types/job-application';
import { isFollowUpDue } from '../utils/is-follow-up-due';

export function FollowUpBadge({ jobApplication }: { jobApplication: JobApplication }) {
  if (!isFollowUpDue(jobApplication, new Date())) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-200">
      <span aria-hidden="true">⏰</span> Follow up
    </span>
  );
}
