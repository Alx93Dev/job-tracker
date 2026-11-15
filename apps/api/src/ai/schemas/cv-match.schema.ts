import { z } from 'zod';

export const MATCH_VERDICTS = ['STRONG', 'PARTIAL', 'WEAK'] as const;

export const cvMatchSchema = z.object({
  matchScore: z
    .number()
    .int()
    .describe('How well the CV fits the role, from 0 (no fit) to 100 (perfect fit)'),
  verdict: z.enum(MATCH_VERDICTS),
  strengths: z.array(z.string()).describe('Requirements the CV clearly covers, with evidence'),
  gaps: z.array(z.string()).describe('Requirements the CV does not show'),
  talkingPoints: z
    .array(z.string())
    .describe('Concrete things to highlight in the cover letter or interview'),
  summary: z.string().describe('Two or three sentence overall assessment'),
});

export type CvMatch = z.infer<typeof cvMatchSchema>;
