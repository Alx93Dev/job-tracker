export type MatchVerdict = 'STRONG' | 'PARTIAL' | 'WEAK';

export interface CvMatch {
  matchScore: number;
  verdict: MatchVerdict;
  strengths: string[];
  gaps: string[];
  talkingPoints: string[];
  summary: string;
}
