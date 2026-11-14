'use client';

import Link from 'next/link';
import { useState } from 'react';
import { JobApplicationList } from '@/features/job-applications/components/job-application-list';
import { StatusFilter } from '@/features/job-applications/components/status-filter';
import {
  useDeleteJobApplication,
  useJobApplications,
} from '@/features/job-applications/hooks/use-job-applications';
import type { ApplicationStatus } from '@/features/job-applications/types/application-status';
import type { JobApplication } from '@/features/job-applications/types/job-application';

export default function JobApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>();
  const jobApplicationsQuery = useJobApplications(selectedStatus);
  const deleteMutation = useDeleteJobApplication();

  const handleDelete = (jobApplication: JobApplication) => {
    const confirmationMessage = `Delete "${jobApplication.positionTitle}" at ${jobApplication.companyName}?`;
    if (window.confirm(confirmationMessage)) {
      deleteMutation.mutate(jobApplication.id);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Link
          href="/applications/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New application
        </Link>
      </div>

      <StatusFilter selectedStatus={selectedStatus} onChange={setSelectedStatus} />

      {deleteMutation.isError && (
        <p role="alert" className="text-sm text-rose-600">
          Could not delete the application: {deleteMutation.error.message}
        </p>
      )}

      {jobApplicationsQuery.isPending && <p aria-live="polite">Loading applications…</p>}
      {jobApplicationsQuery.isError && (
        <p role="alert" className="text-sm text-rose-600">
          Could not load applications: {jobApplicationsQuery.error.message}
        </p>
      )}
      {jobApplicationsQuery.isSuccess && (
        <JobApplicationList
          jobApplications={jobApplicationsQuery.data}
          deletingApplicationId={deleteMutation.isPending ? deleteMutation.variables : undefined}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
