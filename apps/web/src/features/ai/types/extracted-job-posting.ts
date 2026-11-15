export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE' | 'UNSPECIFIED';

export interface ExtractedJobPosting {
  companyName: string;
  positionTitle: string;
  location: string | null;
  workMode: WorkMode;
  salaryRange: string | null;
  seniority: string | null;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  summary: string;
}
