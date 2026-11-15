import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications-api';

export const notificationsKey = ['notifications'] as const;

/** Reminders are created by a background job, so the list is polled while the tab is open. */
const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000;

export function useNotifications(isEnabled: boolean) {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: notificationsApi.list,
    enabled: isEnabled,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}
