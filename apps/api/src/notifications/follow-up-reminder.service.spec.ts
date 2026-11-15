import { Test } from '@nestjs/testing';
import { ApplicationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FollowUpReminderService } from './follow-up-reminder.service';

const now = new Date('2026-11-15T09:00:00.000Z');

describe('FollowUpReminderService', () => {
  const prisma = {
    jobApplication: { findMany: jest.fn(), updateMany: jest.fn() },
    notification: { createMany: jest.fn() },
    $transaction: jest.fn(),
  };
  let reminderService: FollowUpReminderService;

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.jobApplication.updateMany.mockReturnValue('update-operation');
    prisma.notification.createMany.mockReturnValue('create-operation');
    const testingModule = await Test.createTestingModule({
      providers: [FollowUpReminderService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    reminderService = testingModule.get(FollowUpReminderService);
  });

  it('only looks at open applications that are due and not yet notified', async () => {
    prisma.jobApplication.findMany.mockResolvedValue([]);

    await expect(reminderService.createDueReminders(now)).resolves.toBe(0);

    expect(prisma.jobApplication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          followUpAt: { lte: now },
          followUpNotifiedAt: null,
          status: { in: [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEW] },
        },
      }),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates one reminder per due application and marks them as notified together', async () => {
    prisma.jobApplication.findMany.mockResolvedValue([
      { id: 'app-1', userId: 'user-1', positionTitle: 'React Dev', companyName: 'Acme' },
      { id: 'app-2', userId: 'user-2', positionTitle: 'UI Engineer', companyName: 'Globex' },
    ]);

    await expect(reminderService.createDueReminders(now)).resolves.toBe(2);

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 'user-1',
          jobApplicationId: 'app-1',
          type: NotificationType.FOLLOW_UP_DUE,
          message: 'Time to follow up on React Dev at Acme',
        },
        {
          userId: 'user-2',
          jobApplicationId: 'app-2',
          type: NotificationType.FOLLOW_UP_DUE,
          message: 'Time to follow up on UI Engineer at Globex',
        },
      ],
    });
    expect(prisma.jobApplication.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['app-1', 'app-2'] } },
      data: { followUpNotifiedAt: now },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(['create-operation', 'update-operation']);
  });
});
