'use client';

import Link from 'next/link';
import type { JobApplication } from '../types/job-application';
import { FollowUpBadge } from './follow-up-badge';
import { StatusBadge } from './status-badge';

interface JobApplicationListProps {
  jobApplications: JobApplication[];
  deletingApplicationId?: string;
  onDelete: (jobApplication: JobApplication) => void;
}

const appliedDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function JobApplicationList({
  jobApplications,
  deletingApplicationId,
  onDelete,
}: JobApplicationListProps) {
  if (jobApplications.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
        No applications yet. Add the first one to start tracking your search.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {jobApplications.map((jobApplication) => (
        <li key={jobApplication.id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{jobApplication.positionTitle}</p>
            <p className="truncate text-sm text-slate-500">
              {[jobApplication.companyName, jobApplication.location].filter(Boolean).join(' · ')}
            </p>
          </div>
          {jobApplication.appliedAt && (
            <time dateTime={jobApplication.appliedAt} className="text-sm text-slate-500">
              {appliedDateFormatter.format(new Date(jobApplication.appliedAt))}
            </time>
          )}
          <FollowUpBadge jobApplication={jobApplication} />
          <StatusBadge status={jobApplication.status} />
          <div className="flex gap-2">
            <Link
              href={`/applications/${jobApplication.id}/edit`}
              aria-label={`Edit ${jobApplication.positionTitle} at ${jobApplication.companyName}`}
              className="rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              Edit
            </Link>
            <button
              type="button"
              disabled={deletingApplicationId === jobApplication.id}
              onClick={() => onDelete(jobApplication)}
              aria-label={`Delete ${jobApplication.positionTitle} at ${jobApplication.companyName}`}
              className="rounded-md px-2 py-1 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
