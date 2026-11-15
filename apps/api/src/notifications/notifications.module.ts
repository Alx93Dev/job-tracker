import { Module } from '@nestjs/common';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, FollowUpReminderService],
  exports: [FollowUpReminderService],
})
export class NotificationsModule {}
