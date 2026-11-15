export const ANTHROPIC_CLIENT = Symbol('ANTHROPIC_CLIENT');

export const DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5';
export const SERVER_SIDE_FALLBACK_BETA = 'server-side-fallback-2026-07-01';
export const AI_MAX_OUTPUT_TOKENS = 16_000;

export const AI_INPUT_LIMITS = {
  jobPostingMaxLength: 20_000,
  cvMaxLength: 30_000,
} as const;

export const MATCH_SCORE_RANGE = { min: 0, max: 100 } as const;

export const AI_RATE_LIMIT = { limit: 10, ttl: 60_000 } as const;

export const AI_ERROR_MESSAGES = {
  notConfigured: 'AI features are not configured on this server',
  providerBusy: 'The AI service is busy. Please try again in a minute.',
  providerFailed: 'The AI service could not complete the request',
  declined: 'The AI service declined to process this content',
  incompleteAnswer: 'The AI answer was incomplete. Please try again with a shorter text.',
} as const;
