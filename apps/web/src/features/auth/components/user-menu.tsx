'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { isPublicAuthRoute, ROUTES } from '@/lib/routes';
import { useCurrentUser, useLogout } from '../hooks/use-auth';

const NAV_LINK_CLASS_NAME =
  'rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 aria-[current=page]:font-semibold sm:px-3 dark:hover:bg-slate-800';

const NAV_LINKS = [
  { href: ROUTES.analytics, label: 'Analytics' },
  { href: ROUTES.profile, label: 'My CV' },
] as const;

export function UserMenu() {
  const pathname = usePathname();
  const isOnAuthPage = isPublicAuthRoute(pathname);
  const currentUserQuery = useCurrentUser(!isOnAuthPage);
  const logoutMutation = useLogout();

  if (isOnAuthPage || !currentUserQuery.data) {
    return null;
  }

  const { name, email } = currentUserQuery.data;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="hidden text-sm text-slate-500 md:inline dark:text-slate-400">
        {name ?? email}
      </span>
      {NAV_LINKS.map((navLink) => (
        <Link
          key={navLink.href}
          href={navLink.href}
          aria-current={pathname === navLink.href ? 'page' : undefined}
          className={NAV_LINK_CLASS_NAME}
        >
          {navLink.label}
        </Link>
      ))}
      <NotificationsMenu />
      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className={`${NAV_LINK_CLASS_NAME} disabled:opacity-60`}
      >
        Log out
      </button>
    </div>
  );
}
