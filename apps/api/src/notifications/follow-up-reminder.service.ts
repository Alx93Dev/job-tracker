import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildFollowUpMessage,
  FOLLOW_UP_REMINDER_STATUSES,
  FOLLOW_UP_SCAN_CRON,
  FOLLOW_UP_SCAN_JOB_NAME,
} from './notifications.constants';

@Injectable()
export class FollowUpReminderService {
  private readonly logger = new Logger(FollowUpReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(FOLLOW_UP_SCAN_CRON, { name: FOLLOW_UP_SCAN_JOB_NAME, timeZone: 'UTC' })
  async runScheduledScan(): Promise<void> {
    const createdCount = await this.createDueReminders(new Date());
    if (createdCount > 0) {
      this.logger.log(`Created ${createdCount} follow-up reminder(s)`);
    }
  }

  /**
   * Each due application gets exactly one reminder: `followUpNotifiedAt` is set in the same
   * transaction, and it is cleared again only when the user picks a new follow-up date.
   * With several API instances this job would need a distributed lock (or a queue) so two
   * instances do not pick up the same rows.
   */
  async createDueReminders(now: Date): Promise<number> {
    const dueApplications = await this.prisma.jobApplication.findMany({
      where: {
        followUpAt: { lte: now },
        followUpNotifiedAt: null,
        status: { in: FOLLOW_UP_REMINDER_STATUSES },
      },
      select: { id: true, userId: true, positionTitle: true, companyName: true },
    });

    if (dueApplications.length === 0) {
      return 0;
    }

    await this.prisma.$transaction([
      this.prisma.notification.createMany({
        data: dueApplications.map((application) => ({
          userId: application.userId,
          jobApplicationId: application.id,
          type: NotificationType.FOLLOW_UP_DUE,
          message: buildFollowUpMessage(application.positionTitle, application.companyName),
        })),
      }),
      this.prisma.jobApplication.updateMany({
        where: { id: { in: dueApplications.map((application) => application.id) } },
        data: { followUpNotifiedAt: now },
      }),
    ]);

    return dueApplications.length;
  }
}
