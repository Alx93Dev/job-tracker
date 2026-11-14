'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { JobApplication } from '../../types/job-application';

interface KanbanCardProps {
  jobApplication: JobApplication;
}

export function KanbanCard({ jobApplication }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: jobApplication.id,
    data: jobApplication,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
      aria-roledescription="draggable application"
      aria-label={`${jobApplication.positionTitle} at ${jobApplication.companyName}`}
      className={`cursor-grab touch-none rounded-md border border-slate-200 bg-white p-3 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <KanbanCardContent jobApplication={jobApplication} />
    </article>
  );
}

export function KanbanCardContent({ jobApplication }: KanbanCardProps) {
  return (
    <>
      <p className="text-sm font-medium">{jobApplication.positionTitle}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {[jobApplication.companyName, jobApplication.location].filter(Boolean).join(' · ')}
      </p>
      <Link
        href={`/applications/${jobApplication.id}/edit`}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
      >
        Edit<span className="sr-only"> {jobApplication.positionTitle}</span>
      </Link>
    </>
  );
}
