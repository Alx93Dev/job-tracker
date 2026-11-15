import { z } from 'zod';

export const WORK_MODES = ['REMOTE', 'HYBRID', 'ONSITE', 'UNSPECIFIED'] as const;

export const extractedJobPostingSchema = z.object({
  companyName: z.string().describe('Hiring company name, or an empty string if not stated'),
  positionTitle: z.string().describe('Job title as written in the posting'),
  location: z.string().nullable().describe('City, region or "Remote"; null if not stated'),
  workMode: z.enum(WORK_MODES),
  salaryRange: z
    .string()
    .nullable()
    .describe('Salary as written, e.g. "35k - 42k EUR"; null if not stated'),
  seniority: z.string().nullable().describe('e.g. Junior, Mid, Senior; null if not stated'),
  requiredSkills: z.array(z.string()).describe('Must-have skills and technologies'),
  niceToHaveSkills: z.array(z.string()).describe('Optional or bonus skills'),
  summary: z.string().describe('Two or three sentences describing the role'),
});

export type ExtractedJobPosting = z.infer<typeof extractedJobPostingSchema>;
