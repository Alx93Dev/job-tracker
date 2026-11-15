export const SHARED_RATE_LIMIT_KEY = 'sharedRateLimit';

/** Buckets older than this are deleted by the daily cleanup; longer than any policy window. */
export const RATE_LIMIT_BUCKET_RETENTION_MS = 24 * 60 * 60 * 1000;

export const RATE_LIMIT_CLEANUP_CRON = '30 3 * * *';
export const RATE_LIMIT_CLEANUP_JOB_NAME = 'rate-limit-cleanup';

export const UNKNOWN_CLIENT_IP = 'unknown';
export const TOO_MANY_REQUESTS_MESSAGE = 'Too many requests. Please try again later.';
