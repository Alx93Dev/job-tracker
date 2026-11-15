import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/environment.validation';
import { CronController } from './cron.controller';
import type { FollowUpReminderService } from './follow-up-reminder.service';

const cronSecret = 'a-cron-secret-of-enough-length';

function buildController(configuredSecret: string | undefined) {
  const createDueReminders = jest.fn().mockResolvedValue(3);
  const cronController = new CronController(
    { createDueReminders } as unknown as FollowUpReminderService,
    { get: () => configuredSecret } as unknown as ConfigService<EnvironmentVariables, true>,
  );
  return { cronController, createDueReminders };
}

describe('CronController', () => {
  it('runs the reminder job with the right bearer secret', async () => {
    const { cronController, createDueReminders } = buildController(cronSecret);

    await expect(cronController.createFollowUpReminders(`Bearer ${cronSecret}`)).resolves.toEqual({
      createdReminders: 3,
    });
    expect(createDueReminders).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a missing header', undefined],
    ['a wrong secret', 'Bearer not-the-secret'],
    ['the secret without the Bearer scheme', cronSecret],
  ])('rejects %s', async (_case, authorization) => {
    const { cronController, createDueReminders } = buildController(cronSecret);

    await expect(cronController.createFollowUpReminders(authorization)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(createDueReminders).not.toHaveBeenCalled();
  });

  it('rejects every call when no secret is configured', async () => {
    const { cronController } = buildController(undefined);

    await expect(cronController.createFollowUpReminders('Bearer undefined')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
