import { buildLoginPath, isPublicAuthRoute } from './routes';

export function redirectToLogin(): void {
  const { pathname, search } = window.location;
  if (isPublicAuthRoute(pathname)) {
    return;
  }
  window.location.assign(buildLoginPath(`${pathname}${search}`));
}
