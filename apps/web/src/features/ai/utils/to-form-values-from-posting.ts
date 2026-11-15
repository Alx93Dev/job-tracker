import {
  emptyJobApplicationFormValues,
  type JobApplicationFormValues,
} from '@/features/job-applications/schemas/job-application-form-schema';
import type { ExtractedJobPosting, WorkMode } from '../types/extracted-job-posting';

const WORK_MODE_LABELS: Record<WorkMode, string | null> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
  UNSPECIFIED: null,
};

function describeLocation(posting: ExtractedJobPosting): string {
  const workModeLabel = WORK_MODE_LABELS[posting.workMode];
  if (!posting.location) {
    return workModeLabel ?? '';
  }
  const isWorkModeAlreadyStated =
    !workModeLabel || posting.location.toLowerCase().includes(workModeLabel.toLowerCase());
  return isWorkModeAlreadyStated ? posting.location : `${posting.location} (${workModeLabel})`;
}

function buildNotes(posting: ExtractedJobPosting): string {
  return [
    posting.summary,
    posting.seniority && `Seniority: ${posting.seniority}`,
    posting.requiredSkills.length > 0 && `Required: ${posting.requiredSkills.join(', ')}`,
    posting.niceToHaveSkills.length > 0 && `Nice to have: ${posting.niceToHaveSkills.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * The original posting is kept as the job description, so the CV match later compares
 * against the full text instead of the model's summary of it.
 */
export function toFormValuesFromPosting(
  posting: ExtractedJobPosting,
  postingText: string,
): JobApplicationFormValues {
  return {
    ...emptyJobApplicationFormValues,
    companyName: posting.companyName,
    positionTitle: posting.positionTitle,
    location: describeLocation(posting),
    salaryRange: posting.salaryRange ?? '',
    notes: buildNotes(posting),
    jobDescription: postingText.trim(),
  };
}
