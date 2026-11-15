export interface RateLimitPolicy {
  /** Resolved on every request so limits can come from the environment. */
  limit: () => number;
  /** Window length in milliseconds. */
  ttl: number;
}

export interface NamedRateLimitPolicy extends RateLimitPolicy {
  name: string;
}
