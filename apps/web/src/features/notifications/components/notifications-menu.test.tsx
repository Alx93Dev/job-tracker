import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notificationsApi } from '../api/notifications-api';
import { NotificationsMenu } from './notifications-menu';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../api/notifications-api', () => ({
  notificationsApi: { list: vi.fn(), markAsRead: vi.fn(), markAllAsRead: vi.fn() },
}));

function renderMenu() {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <NotificationsMenu />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

describe('NotificationsMenu', () => {
  // Braces matter: Vitest runs a function returned from beforeEach as a teardown.
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(undefined);
    vi.mocked(notificationsApi.list).mockResolvedValue({
      unreadCount: 1,
      items: [
        {
          id: 'notification-1',
          type: 'FOLLOW_UP_DUE',
          message: 'Time to follow up on React Dev at Acme',
          jobApplicationId: 'application-1',
          readAt: null,
          createdAt: '2026-11-15T09:00:00.000Z',
        },
      ],
    });
  });

  it('announces the unread count on the bell button', async () => {
    renderMenu();

    expect(await screen.findByRole('button', { name: 'Notifications, 1 unread' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens a reminder: marks it as read and goes to the application', async () => {
    const user = renderMenu();

    await user.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
    await user.click(screen.getByRole('button', { name: /Time to follow up on React Dev/ }));

    expect(vi.mocked(notificationsApi.markAsRead).mock.calls[0][0]).toBe('notification-1');
    expect(pushMock).toHaveBeenCalledWith('/applications/application-1/edit');
  });

  it('closes with the Escape key', async () => {
    const user = renderMenu();
    const bellButton = await screen.findByRole('button', { name: 'Notifications, 1 unread' });

    await user.click(bellButton);
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeVisible();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { name: 'Notifications' })).not.toBeInTheDocument();
  });
});
