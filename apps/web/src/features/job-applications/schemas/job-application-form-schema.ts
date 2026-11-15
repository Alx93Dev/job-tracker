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
  followUpAt: z.string(),
  notes: z.string().trim().max(JOB_APPLICATION_LIMITS.notesMaxLength),
  jobDescription: z.string().trim().max(JOB_APPLICATION_LIMITS.jobDescriptionMaxLength),
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
  followUpAt: '',
  notes: '',
  jobDescription: '',
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
    followUpAt: jobApplication.followUpAt?.slice(0, ISO_DATE_LENGTH) ?? '',
    notes: jobApplication.notes ?? '',
    jobDescription: jobApplication.jobDescription ?? '',
  };
}

export function toPayload(formValues: JobApplicationFormValues): JobApplicationPayload {
  // null (not undefined) so that clearing a field while editing also clears it on the server
  const emptyToNull = (value: string) => (value === '' ? null : value);

  return {
    companyName: formValues.companyName,
    positionTitle: formValues.positionTitle,
    jobUrl: emptyToNull(formValues.jobUrl),
    location: emptyToNull(formValues.location),
    salaryRange: emptyToNull(formValues.salaryRange),
    status: formValues.status,
    appliedAt: emptyToNull(formValues.appliedAt),
    followUpAt: emptyToNull(formValues.followUpAt),
    notes: emptyToNull(formValues.notes),
    jobDescription: emptyToNull(formValues.jobDescription),
  };
}
