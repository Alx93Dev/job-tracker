'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { useId, type KeyboardEventHandler } from 'react';
import type { JobApplication } from '../../types/job-application';
import { FollowUpBadge } from '../follow-up-badge';

interface KanbanCardProps {
  jobApplication: JobApplication;
}

/**
 * The card is not itself a button: it holds a link, and interactive controls must not be
 * nested. Mouse and touch users can drag the whole card; keyboard and screen reader users
 * use the dedicated drag handle, which is the dnd-kit activator.
 */
export function KanbanCard({ jobApplication }: KanbanCardProps) {
  const titleId = useId();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useDraggable({ id: jobApplication.id, data: jobApplication });
  const { onKeyDown: handleDragKeyDown, ...pointerListeners } = listeners ?? {};

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...pointerListeners}
      aria-labelledby={titleId}
      className={`relative cursor-grab touch-none rounded-md border border-slate-200 bg-white p-3 pr-9 shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        onKeyDown={handleDragKeyDown as KeyboardEventHandler<HTMLButtonElement> | undefined}
        aria-label={`Move ${jobApplication.positionTitle} at ${jobApplication.companyName}`}
        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <span aria-hidden="true">⠿</span>
      </button>
      <KanbanCardContent jobApplication={jobApplication} titleId={titleId} />
    </article>
  );
}

export function KanbanCardContent({
  jobApplication,
  titleId,
}: KanbanCardProps & { titleId?: string }) {
  return (
    <>
      <p id={titleId} className="text-sm font-medium">
        {jobApplication.positionTitle}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {[jobApplication.companyName, jobApplication.location].filter(Boolean).join(' · ')}
      </p>
      <div className="mt-1.5">
        <FollowUpBadge jobApplication={jobApplication} />
      </div>
      <Link
        href={`/applications/${jobApplication.id}/edit`}
        prefetch={false}
        onPointerDown={(event) => event.stopPropagation()}
        className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
      >
        Edit <span className="sr-only">{jobApplication.positionTitle}</span>
      </Link>
    </>
  );
}
