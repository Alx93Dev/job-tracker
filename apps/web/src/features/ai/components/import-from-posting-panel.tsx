'use client';

import { useMutation } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { INPUT_CLASS_NAME, SECONDARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import type { JobApplicationFormValues } from '@/features/job-applications/schemas/job-application-form-schema';
import { aiApi } from '../api/ai-api';
import { AI_INPUT_LIMITS } from '../constants/ai-limits';
import { toFormValuesFromPosting } from '../utils/to-form-values-from-posting';

interface ImportFromPostingPanelProps {
  onImported: (formValues: JobApplicationFormValues) => void;
}

export function ImportFromPostingPanel({ onImported }: ImportFromPostingPanelProps) {
  const textareaId = useId();
  const hintId = useId();
  const [postingText, setPostingText] = useState('');
  const extractMutation = useMutation({
    mutationFn: aiApi.extractJobPosting,
    onSuccess: (extractedPosting) =>
      onImported(toFormValuesFromPosting(extractedPosting, postingText)),
  });

  const trimmedPostingText = postingText.trim();

  return (
    <section
      aria-labelledby={`${textareaId}-heading`}
      className="flex flex-col gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20"
    >
      <h2 id={`${textareaId}-heading`} className="text-sm font-semibold">
        ✨ Fill in from a job posting
      </h2>
      <label htmlFor={textareaId} className="sr-only">
        Job posting text
      </label>
      <textarea
        id={textareaId}
        value={postingText}
        onChange={(event) => setPostingText(event.target.value)}
        maxLength={AI_INPUT_LIMITS.jobPostingMaxLength}
        rows={5}
        placeholder="Paste the full job posting here…"
        aria-describedby={hintId}
        className={INPUT_CLASS_NAME}
      />
      <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
        AI reads the posting and fills the form below. Review the details before saving.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => extractMutation.mutate(trimmedPostingText)}
          disabled={!trimmedPostingText || extractMutation.isPending}
          className={SECONDARY_BUTTON_CLASS_NAME}
        >
          {extractMutation.isPending ? 'Reading posting…' : 'Extract details'}
        </button>
        <p aria-live="polite" className="text-sm">
          {extractMutation.isSuccess && (
            <span className="text-emerald-700 dark:text-emerald-400">
              Form filled in. Review it before saving.
            </span>
          )}
        </p>
      </div>
      {extractMutation.isError && (
        <p role="alert" className="text-sm text-rose-600">
          {extractMutation.error.message}
        </p>
      )}
    </section>
  );
}
