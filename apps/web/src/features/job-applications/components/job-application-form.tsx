'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/form/form-field';
import { INPUT_CLASS_NAME, PRIMARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
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
        <select {...register('status')} className={INPUT_CLASS_NAME}>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
        Notes
        <textarea {...register('notes')} rows={4} className={INPUT_CLASS_NAME} />
      </label>

      {submitErrorMessage && (
        <p role="alert" className="text-sm text-rose-600 sm:col-span-2">
          {submitErrorMessage}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className={PRIMARY_BUTTON_CLASS_NAME}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
