import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAMES, buildLoginPath, isPublicAuthRoute, ROUTES } from './lib/routes';

/**
 * Cookie presence is only a hint used to avoid rendering protected pages for signed-out
 * visitors. The API validates the tokens on every request; an invalid session is detected
 * there and the client is sent back to the login page.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = AUTH_COOKIE_NAMES.some((cookieName) => request.cookies.has(cookieName));
  const isAuthRoute = isPublicAuthRoute(pathname);

  if (!hasSessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL(buildLoginPath(`${pathname}${search}`), request.url));
  }

  if (hasSessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
