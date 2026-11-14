'use client';

import { usePathname } from 'next/navigation';
import { isPublicAuthRoute } from '@/lib/routes';
import { useCurrentUser, useLogout } from '../hooks/use-auth';

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
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
        {name ?? email}
      </span>
      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="rounded-md px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800"
      >
        Log out
      </button>
    </div>
  );
}
