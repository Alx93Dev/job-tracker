'use client';

import Link from 'next/link';
import { SECONDARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import { useCvMatch } from '@/features/job-applications/hooks/use-job-applications';
import type { JobApplication } from '@/features/job-applications/types/job-application';
import { ROUTES } from '@/lib/routes';
import { MATCH_VERDICT_CLASSES, MATCH_VERDICT_LABELS } from '../constants/ai-limits';
import type { CvMatch } from '../types/cv-match';

interface CvMatchPanelProps {
  jobApplication: JobApplication;
}

const matchedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function CvMatchPanel({ jobApplication }: CvMatchPanelProps) {
  const cvMatchMutation = useCvMatch(jobApplication.id);
  const { cvMatch, cvMatchedAt, jobDescription } = jobApplication;

  return (
    <section
      aria-labelledby="cv-match-heading"
      className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="cv-match-heading" className="text-lg font-semibold">
            ✨ CV match
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare this job with{' '}
            <Link
              href={ROUTES.profile}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              your CV
            </Link>{' '}
            to see what fits, what is missing and what to highlight.
          </p>
        </div>
        <button
          type="button"
          onClick={() => cvMatchMutation.mutate()}
          disabled={!jobDescription || cvMatchMutation.isPending}
          className={SECONDARY_BUTTON_CLASS_NAME}
        >
          {cvMatchMutation.isPending
            ? 'Comparing…'
            : cvMatch
              ? 'Compare again'
              : 'Compare with my CV'}
        </button>
      </div>

      {!jobDescription && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add the job description above and save to enable the comparison.
        </p>
      )}
      {cvMatchMutation.isError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {cvMatchMutation.error.message}
        </p>
      )}
      <div aria-live="polite">
        {cvMatch && <CvMatchResult cvMatch={cvMatch} matchedAt={cvMatchedAt} />}
      </div>
    </section>
  );
}

function CvMatchResult({ cvMatch, matchedAt }: { cvMatch: CvMatch; matchedAt: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold tabular-nums">{cvMatch.matchScore}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${MATCH_VERDICT_CLASSES[cvMatch.verdict]}`}
        >
          {MATCH_VERDICT_LABELS[cvMatch.verdict]}
        </span>
        {matchedAt && (
          <time dateTime={matchedAt} className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            {matchedAtFormatter.format(new Date(matchedAt))}
          </time>
        )}
      </div>
      <p className="text-sm">{cvMatch.summary}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <MatchList title="Strengths" items={cvMatch.strengths} />
        <MatchList title="Gaps" items={cvMatch.gaps} />
        <MatchList title="Talking points" items={cvMatch.talkingPoints} />
      </div>
    </div>
  );
}

function MatchList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">None</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
