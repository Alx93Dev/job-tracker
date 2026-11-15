'use client';

import { useId, useState } from 'react';
import { INPUT_CLASS_NAME, PRIMARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import { AI_INPUT_LIMITS } from '@/features/ai/constants/ai-limits';
import { useUpdateCv } from '../hooks/use-cv';
import type { CvProfile } from '../types/cv-profile';

const updatedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function CvForm({ cvProfile }: { cvProfile: CvProfile }) {
  const textareaId = useId();
  const counterId = useId();
  const [cvText, setCvText] = useState(cvProfile.cvText ?? '');
  const updateCvMutation = useUpdateCv();
  const hasUnsavedChanges = cvText !== (cvProfile.cvText ?? '');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        updateCvMutation.mutate(cvText);
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor={textareaId} className="text-sm font-medium">
        CV (plain text)
      </label>
      <textarea
        id={textareaId}
        value={cvText}
        onChange={(event) => setCvText(event.target.value)}
        maxLength={AI_INPUT_LIMITS.cvMaxLength}
        rows={18}
        placeholder="Paste your CV here: experience, projects, skills, education…"
        aria-describedby={counterId}
        className={`${INPUT_CLASS_NAME} font-mono text-xs leading-relaxed`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span id={counterId}>
          {cvText.length.toLocaleString()} / {AI_INPUT_LIMITS.cvMaxLength.toLocaleString()}{' '}
          characters
        </span>
        {cvProfile.cvUpdatedAt && (
          <span>
            Last saved{' '}
            <time dateTime={cvProfile.cvUpdatedAt}>
              {updatedAtFormatter.format(new Date(cvProfile.cvUpdatedAt))}
            </time>
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!hasUnsavedChanges || updateCvMutation.isPending}
          className={PRIMARY_BUTTON_CLASS_NAME}
        >
          {updateCvMutation.isPending ? 'Saving…' : 'Save CV'}
        </button>
        <p aria-live="polite" className="text-sm text-emerald-700 dark:text-emerald-400">
          {updateCvMutation.isSuccess && !hasUnsavedChanges && 'CV saved.'}
        </p>
      </div>
      {updateCvMutation.isError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {updateCvMutation.error.message}
        </p>
      )}
    </form>
  );
}
