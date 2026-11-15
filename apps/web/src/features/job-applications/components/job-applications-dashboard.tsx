'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  parseViewMode,
  SEARCH_DEBOUNCE_MS,
  VIEW_QUERY_PARAM,
  type ViewMode,
} from '../constants/view-modes';
import {
  useChangeJobApplicationStatus,
  useDeleteJobApplication,
  useJobApplications,
} from '../hooks/use-job-applications';
import type { ApplicationStatus } from '../types/application-status';
import type { JobApplication } from '../types/job-application';
import { JobApplicationList } from './job-application-list';
import { KanbanBoard } from './kanban/kanban-board';
import { SearchInput } from './search-input';
import { StatusFilter } from './status-filter';
import { ViewToggle } from './view-toggle';

export function JobApplicationsDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewMode = parseViewMode(searchParams.get(VIEW_QUERY_PARAM));

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText.trim(), SEARCH_DEBOUNCE_MS);

  const isBoardView = viewMode === 'board';
  const jobApplicationsQuery = useJobApplications({
    status: isBoardView ? undefined : selectedStatus,
    search: debouncedSearch || undefined,
  });
  const statusChangeMutation = useChangeJobApplicationStatus();
  const deleteMutation = useDeleteJobApplication();

  const changeViewMode = (nextViewMode: ViewMode) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(VIEW_QUERY_PARAM, nextViewMode);
    router.replace(`${pathname}?${nextSearchParams}`, { scroll: false });
  };

  const handleDelete = (jobApplication: JobApplication) => {
    const confirmationMessage = `Delete "${jobApplication.positionTitle}" at ${jobApplication.companyName}?`;
    if (window.confirm(confirmationMessage)) {
      deleteMutation.mutate(jobApplication.id);
    }
  };

  const mutationError = statusChangeMutation.error ?? deleteMutation.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={searchText} onChange={setSearchText} />
        <ViewToggle selectedViewMode={viewMode} onChange={changeViewMode} />
      </div>

      {!isBoardView && (
        <StatusFilter selectedStatus={selectedStatus} onChange={setSelectedStatus} />
      )}

      {mutationError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          Could not save your change: {mutationError.message}
        </p>
      )}

      {jobApplicationsQuery.isPending && <p aria-live="polite">Loading applications…</p>}
      {jobApplicationsQuery.isError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          Could not load applications: {jobApplicationsQuery.error.message}
        </p>
      )}
      {jobApplicationsQuery.isSuccess &&
        (isBoardView ? (
          <KanbanBoard
            jobApplications={jobApplicationsQuery.data}
            onStatusChange={(statusChange) => statusChangeMutation.mutate(statusChange)}
          />
        ) : (
          <JobApplicationList
            jobApplications={jobApplicationsQuery.data}
            deletingApplicationId={deleteMutation.isPending ? deleteMutation.variables : undefined}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
}
