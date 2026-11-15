import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'node:crypto';
import { IS_IN_PROCESS_SCHEDULER_DISABLED } from '../notifications/notifications.constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  RATE_LIMIT_BUCKET_RETENTION_MS,
  RATE_LIMIT_CLEANUP_CRON,
  RATE_LIMIT_CLEANUP_JOB_NAME,
} from './rate-limit.constants';
import type { NamedRateLimitPolicy } from './rate-limit-policy';

export interface RateLimitDecision {
  isAllowed: boolean;
  retryAfterSeconds: number;
}

const MILLISECONDS_PER_SECOND = 1000;

/** IPs are personal data, so only a hash is stored. */
function hashClientIp(clientIp: string): string {
  return createHash('sha256').update(clientIp).digest('hex');
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fixed-window counter. A single upsert increments the bucket, or restarts it when a new
   * window has begun, so concurrent requests on different instances never lose a count.
   */
  async consume(
    policy: NamedRateLimitPolicy,
    clientIp: string,
    now: Date,
  ): Promise<RateLimitDecision> {
    const windowStartMs = Math.floor(now.getTime() / policy.ttl) * policy.ttl;
    const windowStart = new Date(windowStartMs);
    const key = `${policy.name}:${hashClientIp(clientIp)}`;

    const [bucket] = await this.prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimitBucket" ("key", "windowStart", "count")
      VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."windowStart" = EXCLUDED."windowStart"
            THEN "RateLimitBucket"."count" + 1
          ELSE 1
        END,
        "windowStart" = EXCLUDED."windowStart"
      RETURNING "count"`;

    const windowEndMs = windowStartMs + policy.ttl;
    return {
      isAllowed: bucket.count <= policy.limit(),
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((windowEndMs - now.getTime()) / MILLISECONDS_PER_SECOND),
      ),
    };
  }

  async deleteExpiredBuckets(now: Date): Promise<number> {
    const { count } = await this.prisma.rateLimitBucket.deleteMany({
      where: { windowStart: { lt: new Date(now.getTime() - RATE_LIMIT_BUCKET_RETENTION_MS) } },
    });
    return count;
  }

  @Cron(RATE_LIMIT_CLEANUP_CRON, {
    name: RATE_LIMIT_CLEANUP_JOB_NAME,
    timeZone: 'UTC',
    disabled: IS_IN_PROCESS_SCHEDULER_DISABLED,
  })
  async runScheduledCleanup(): Promise<void> {
    const deletedCount = await this.deleteExpiredBuckets(new Date());
    if (deletedCount > 0) {
      this.logger.log(`Deleted ${deletedCount} expired rate limit bucket(s)`);
    }
  }
}
