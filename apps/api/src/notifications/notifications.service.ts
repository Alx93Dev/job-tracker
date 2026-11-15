import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationListResponseDto } from './dto/notification-list-response.dto';
import { NOTIFICATIONS_PAGE_SIZE } from './notifications.constants';

const notificationResponseSelect = {
  id: true,
  type: true,
  message: true,
  jobApplicationId: true,
  readAt: true,
  createdAt: true,
} as const;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<NotificationListResponseDto> {
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: NOTIFICATIONS_PAGE_SIZE,
        select: notificationResponseSelect,
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, unreadCount };
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    const { count: updatedCount } = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });

    if (updatedCount === 0) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
