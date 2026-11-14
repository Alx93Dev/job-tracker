import { createHash } from 'node:crypto';

/**
 * Refresh tokens are 48 random bytes, so a fast SHA-256 is enough: there is nothing to
 * brute-force, and storing only the hash means a database leak does not expose live sessions.
 */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
