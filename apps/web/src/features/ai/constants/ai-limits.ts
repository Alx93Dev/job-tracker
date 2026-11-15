export const AI_INPUT_LIMITS = {
  jobPostingMaxLength: 20_000,
  cvMaxLength: 30_000,
} as const;

export const MATCH_VERDICT_LABELS = {
  STRONG: 'Strong match',
  PARTIAL: 'Partial match',
  WEAK: 'Weak match',
} as const;

export const MATCH_VERDICT_CLASSES = {
  STRONG: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  PARTIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  WEAK: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
} as const;
