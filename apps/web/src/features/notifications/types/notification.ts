export type NotificationType = 'FOLLOW_UP_DUE';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  jobApplicationId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: AppNotification[];
  unreadCount: number;
}
