import { z } from 'zod';
import { JOB_APPLICATION_LIMITS } from '../constants/job-application-limits';
import { APPLICATION_STATUSES } from '../types/application-status';
import type { JobApplication } from '../types/job-application';
import type { JobApplicationPayload } from '../types/job-application-payload';

const optionalShortText = z.string().trim().max(JOB_APPLICATION_LIMITS.shortTextMaxLength);

export const jobApplicationFormSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, 'Company is required')
    .max(JOB_APPLICATION_LIMITS.shortTextMaxLength),
  positionTitle: z
    .string()
    .trim()
    .min(1, 'Position is required')
    .max(JOB_APPLICATION_LIMITS.shortTextMaxLength),
  jobUrl: z.union([
    z.literal(''),
    z.url('Enter a valid URL').max(JOB_APPLICATION_LIMITS.urlMaxLength),
  ]),
  location: optionalShortText,
  salaryRange: optionalShortText,
  status: z.enum(APPLICATION_STATUSES),
  appliedAt: z.string(),
  notes: z.string().trim().max(JOB_APPLICATION_LIMITS.notesMaxLength),
});

export type JobApplicationFormValues = z.infer<typeof jobApplicationFormSchema>;

const ISO_DATE_LENGTH = 10;

export const emptyJobApplicationFormValues: JobApplicationFormValues = {
  companyName: '',
  positionTitle: '',
  jobUrl: '',
  location: '',
  salaryRange: '',
  status: 'WISHLIST',
  appliedAt: '',
  notes: '',
};

export function toFormValues(jobApplication: JobApplication): JobApplicationFormValues {
  return {
    companyName: jobApplication.companyName,
    positionTitle: jobApplication.positionTitle,
    jobUrl: jobApplication.jobUrl ?? '',
    location: jobApplication.location ?? '',
    salaryRange: jobApplication.salaryRange ?? '',
    status: jobApplication.status,
    appliedAt: jobApplication.appliedAt?.slice(0, ISO_DATE_LENGTH) ?? '',
    notes: jobApplication.notes ?? '',
  };
}

export function toPayload(formValues: JobApplicationFormValues): JobApplicationPayload {
  const emptyToUndefined = (value: string) => (value === '' ? undefined : value);

  return {
    companyName: formValues.companyName,
    positionTitle: formValues.positionTitle,
    jobUrl: emptyToUndefined(formValues.jobUrl),
    location: emptyToUndefined(formValues.location),
    salaryRange: emptyToUndefined(formValues.salaryRange),
    status: formValues.status,
    appliedAt: emptyToUndefined(formValues.appliedAt),
    notes: emptyToUndefined(formValues.notes),
  };
}
