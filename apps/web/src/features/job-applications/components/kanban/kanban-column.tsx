'use client';

import { useDroppable } from '@dnd-kit/core';
import { APPLICATION_STATUS_LABELS } from '../../constants/application-status-display';
import type { ApplicationStatus } from '../../types/application-status';
import type { JobApplication } from '../../types/job-application';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  status: ApplicationStatus;
  jobApplications: JobApplication[];
}

export function KanbanColumn({ status, jobApplications }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const headingId = `kanban-column-${status}`;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className={`flex min-h-64 w-64 shrink-0 flex-col gap-3 rounded-lg border p-3 transition-colors md:w-auto md:shrink ${
        isOver
          ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/40'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      <h2 id={headingId} className="flex items-center justify-between text-sm font-semibold">
        {APPLICATION_STATUS_LABELS[status]}
        <span className="rounded-full bg-slate-200 px-2 text-xs font-medium dark:bg-slate-800">
          {jobApplications.length}
        </span>
      </h2>
      <ul className="flex flex-col gap-2">
        {jobApplications.map((jobApplication) => (
          <li key={jobApplication.id}>
            <KanbanCard jobApplication={jobApplication} />
          </li>
        ))}
      </ul>
    </section>
  );
}
