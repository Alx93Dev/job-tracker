import { createHash } from 'node:crypto';
import type { PrismaService } from '../prisma/prisma.service';
import { RateLimitService } from './rate-limit.service';

const loginPolicy = { name: 'auth:login', limit: () => 5, ttl: 60_000 };

describe('RateLimitService', () => {
  const queryRaw = jest.fn<Promise<{ count: number }[]>, unknown[]>();
  const deleteMany = jest.fn();
  const rateLimitService = new RateLimitService({
    $queryRaw: queryRaw,
    rateLimitBucket: { deleteMany },
  } as unknown as PrismaService);

  beforeEach(() => {
    queryRaw.mockReset();
    deleteMany.mockReset();
  });

  it('counts per policy and hashed IP, never storing the raw IP', async () => {
    queryRaw.mockResolvedValue([{ count: 1 }]);

    await rateLimitService.consume(loginPolicy, '203.0.113.7', new Date('2026-11-15T10:00:30Z'));

    const queryValues = queryRaw.mock.calls[0].slice(1);
    const expectedKey = `auth:login:${createHash('sha256').update('203.0.113.7').digest('hex')}`;
    expect(queryValues).toContain(expectedKey);
    expect(queryValues).not.toContain('203.0.113.7');
    expect(queryValues).toContainEqual(new Date('2026-11-15T10:00:00Z'));
  });

  it('allows requests up to the limit and rejects the next one', async () => {
    const now = new Date('2026-11-15T10:00:45Z');

    queryRaw.mockResolvedValueOnce([{ count: 5 }]);
    await expect(rateLimitService.consume(loginPolicy, '203.0.113.7', now)).resolves.toEqual({
      isAllowed: true,
      retryAfterSeconds: 15,
    });

    queryRaw.mockResolvedValueOnce([{ count: 6 }]);
    await expect(rateLimitService.consume(loginPolicy, '203.0.113.7', now)).resolves.toEqual({
      isAllowed: false,
      retryAfterSeconds: 15,
    });
  });

  it('deletes buckets older than a day', async () => {
    deleteMany.mockResolvedValue({ count: 4 });

    await expect(
      rateLimitService.deleteExpiredBuckets(new Date('2026-11-15T10:00:00Z')),
    ).resolves.toBe(4);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { windowStart: { lt: new Date('2026-11-14T10:00:00Z') } },
    });
  });
});
