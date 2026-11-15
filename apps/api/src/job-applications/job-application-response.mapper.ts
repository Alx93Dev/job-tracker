import type { Prisma } from '@prisma/client';
import { cvMatchSchema } from '../ai/schemas/cv-match.schema';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { jobApplicationResponseSelect } from './job-applications.constants';

export type JobApplicationRecord = Prisma.JobApplicationGetPayload<{
  select: typeof jobApplicationResponseSelect;
}>;

/**
 * `cvMatch` is stored as JSON, so it is validated again on the way out: a row written by
 * an older schema version is returned without a match instead of with a malformed one.
 */
export function toJobApplicationResponse(record: JobApplicationRecord): JobApplicationResponseDto {
  const storedMatch = cvMatchSchema.safeParse(record.cvMatch);
  return { ...record, cvMatch: storedMatch.success ? storedMatch.data : null };
}
