import { SetMetadata } from '@nestjs/common';
import { SHARED_RATE_LIMIT_KEY } from './rate-limit.constants';
import type { NamedRateLimitPolicy, RateLimitPolicy } from './rate-limit-policy';

/**
 * Limits a route per client IP with counters stored in PostgreSQL, so the limit holds
 * across every API instance (serverless platforms run several at once).
 */
export const SharedRateLimit = (name: string, policy: RateLimitPolicy) =>
  SetMetadata(SHARED_RATE_LIMIT_KEY, { name, ...policy } satisfies NamedRateLimitPolicy);
