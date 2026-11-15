import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController, CronController],
  providers: [NotificationsService, FollowUpReminderService],
  exports: [FollowUpReminderService],
})
export class NotificationsModule {}
