export const API_BASE_PATH = '/api';

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
} as const;

export const PUBLIC_AUTH_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register];

export const AUTH_COOKIE_NAMES = ['access_token', 'refresh_token'] as const;

export const NEXT_PATH_QUERY_PARAM = 'next';

export function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.includes(pathname);
}

/**
 * Only same-site relative paths are accepted as a post-login destination, so a crafted
 * ?next=https://evil.example link cannot turn the login page into an open redirect.
 */
export function toSafeNextPath(rawNextPath: string | null): string {
  const isSameSitePath =
    rawNextPath?.startsWith('/') && !rawNextPath.startsWith('//') && !rawNextPath.includes('\\');
  return isSameSitePath && rawNextPath ? rawNextPath : ROUTES.home;
}

export function buildLoginPath(nextPath: string): string {
  if (nextPath === ROUTES.home) {
    return ROUTES.login;
  }
  return `${ROUTES.login}?${new URLSearchParams({ [NEXT_PATH_QUERY_PARAM]: nextPath })}`;
}
