const ONE_MINUTE_MS = 60_000;

const DEFAULT_LIMITS_PER_MINUTE = {
  global: 120,
  auth: 5,
  ai: 10,
} as const;

/**
 * Route decorators are evaluated when their file is imported, before the .env file is
 * loaded, so limits are resolved lazily on each request. Values are validated at startup
 * by `validateEnvironment`; the default applies when the variable is not set.
 */
function limitFromEnvironment(variableName: string, defaultLimit: number): () => number {
  return () => {
    const configuredLimit = Number(process.env[variableName]);
    return Number.isInteger(configuredLimit) && configuredLimit > 0
      ? configuredLimit
      : defaultLimit;
  };
}

export const GLOBAL_RATE_LIMIT = {
  limit: limitFromEnvironment('GLOBAL_RATE_LIMIT_PER_MINUTE', DEFAULT_LIMITS_PER_MINUTE.global),
  ttl: ONE_MINUTE_MS,
};

export const AUTH_RATE_LIMIT = {
  limit: limitFromEnvironment('AUTH_RATE_LIMIT_PER_MINUTE', DEFAULT_LIMITS_PER_MINUTE.auth),
  ttl: ONE_MINUTE_MS,
};

export const AI_RATE_LIMIT = {
  limit: limitFromEnvironment('AI_RATE_LIMIT_PER_MINUTE', DEFAULT_LIMITS_PER_MINUTE.ai),
  ttl: ONE_MINUTE_MS,
};
