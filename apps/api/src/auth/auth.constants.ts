export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const IS_PUBLIC_ROUTE_KEY = 'isPublicRoute';

export const REFRESH_TOKEN_BYTES = 48;
export const MILLISECONDS_PER_SECOND = 1000;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * MILLISECONDS_PER_SECOND;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const NAME_MAX_LENGTH = 80;

export const AUTH_RATE_LIMIT = { limit: 5, ttl: 60_000 } as const;
export const GLOBAL_RATE_LIMIT = { limit: 120, ttl: 60_000 } as const;

export const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  emailTaken: 'An account with this email already exists',
  sessionExpired: 'Your session has expired. Please sign in again.',
  notAuthenticated: 'Authentication required',
  demoUnavailable: 'The demo account is not available',
} as const;
