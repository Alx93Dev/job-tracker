import { apiRequest } from '@/lib/api-client';
import type { NotificationList } from '../types/notification';

export const notificationsApi = {
  list(): Promise<NotificationList> {
    return apiRequest('/notifications');
  },

  markAsRead(id: string): Promise<void> {
    return apiRequest(`/notifications/${id}/read`, { method: 'POST' });
  },

  markAllAsRead(): Promise<void> {
    return apiRequest('/notifications/read-all', { method: 'POST' });
  },
};
