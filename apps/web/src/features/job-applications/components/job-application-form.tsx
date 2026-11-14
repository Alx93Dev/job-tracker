'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { APPLICATION_STATUS_LABELS } from '../constants/application-status-display';
import {
  emptyJobApplicationFormValues,
  jobApplicationFormSchema,
  toPayload,
  type JobApplicationFormValues,
} from '../schemas/job-application-form-schema';
import { APPLICATION_STATUSES } from '../types/application-status';
import type { JobApplicationPayload } from '../types/job-application-payload';

interface JobApplicationFormProps {
  initialValues?: JobApplicationFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitErrorMessage?: string;
  onSubmit: (payload: JobApplicationPayload) => void;
}

const inputClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 aria-[invalid=true]:border-rose-500 dark:border-slate-700 dark:bg-slate-900';

export function JobApplicationForm({
  initialValues = emptyJobApplicationFormValues,
  submitLabel,
  isSubmitting,
  submitErrorMessage,
  onSubmit,
}: JobApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobApplicationFormValues>({
    resolver: zodResolver(jobApplicationFormSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((formValues) => onSubmit(toPayload(formValues)))}
      className="grid gap-5 sm:grid-cols-2"
    >
      <FormField
        label="Company"
        registration={register('companyName')}
        error={errors.companyName}
        required
      />
      <FormField
        label="Position"
        registration={register('positionTitle')}
        error={errors.positionTitle}
        required
      />
      <FormField
        label="Job URL"
        type="url"
        registration={register('jobUrl')}
        error={errors.jobUrl}
      />
      <FormField label="Location" registration={register('location')} error={errors.location} />
      <FormField
        label="Salary range"
        registration={register('salaryRange')}
        error={errors.salaryRange}
      />
      <FormField
        label="Applied on"
        type="date"
        registration={register('appliedAt')}
        error={errors.appliedAt}
      />

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Status
        <select {...register('status')} className={inputClassName}>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
        Notes
        <textarea {...register('notes')} rows={4} className={inputClassName} />
      </label>

      {submitErrorMessage && (
        <p role="alert" className="text-sm text-rose-600 sm:col-span-2">
          {submitErrorMessage}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  type?: 'text' | 'url' | 'date';
  required?: boolean;
}

function FormField({
  label,
  registration,
  error,
  type = 'text',
  required = false,
}: FormFieldProps) {
  const errorId = useId();

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <input
        {...registration}
        type={type}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClassName}
      />
      {error && (
        <span id={errorId} className="text-xs font-normal text-rose-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
