import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { timingSafeEqual } from 'node:crypto';
import { Public } from '../auth/decorators/public.decorator';
import type { EnvironmentVariables } from '../config/environment.validation';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { CRON_AUTHORIZATION_SCHEME } from './notifications.constants';

function isSameSecret(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

/**
 * Entry point for scheduled jobs on serverless hosting (Vercel Cron Jobs). It is not behind
 * the user session guard, so it only runs with the shared CRON_SECRET; without a configured
 * secret every call is rejected.
 */
@ApiExcludeController()
@Public()
@SkipThrottle()
@Controller('cron')
export class CronController {
  constructor(
    private readonly followUpReminderService: FollowUpReminderService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  @Get('follow-up-reminders')
  async createFollowUpReminders(
    @Headers('authorization') authorization?: string,
  ): Promise<{ createdReminders: number }> {
    const cronSecret = this.configService.get('CRON_SECRET', { infer: true });
    const expectedAuthorization = `${CRON_AUTHORIZATION_SCHEME} ${cronSecret}`;

    if (!cronSecret || !authorization || !isSameSecret(authorization, expectedAuthorization)) {
      throw new UnauthorizedException();
    }

    return {
      createdReminders: await this.followUpReminderService.createDueReminders(new Date()),
    };
  }
}
