import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const queryRaw = jest.fn();
  const healthController = new HealthController({
    $queryRaw: queryRaw,
  } as unknown as PrismaService);

  beforeEach(() => {
    queryRaw.mockReset();
  });

  it('reports ok when the database answers', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(healthController.check()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('answers 503 when the database is unreachable', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'));

    await expect(healthController.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
