import { describe, expect, it } from 'vitest';
import { buildLoginPath, isPublicAuthRoute, toSafeNextPath } from './routes';

describe('toSafeNextPath', () => {
  it.each(['/', '/applications/new', '/?view=list'])('keeps the relative path %s', (path) => {
    expect(toSafeNextPath(path)).toBe(path);
  });

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
  ])('falls back to the home page for %s', (unsafePath) => {
    expect(toSafeNextPath(unsafePath)).toBe('/');
  });
});

describe('buildLoginPath', () => {
  it('omits the next parameter for the home page', () => {
    expect(buildLoginPath('/')).toBe('/login');
  });

  it('encodes the page to return to after signing in', () => {
    expect(buildLoginPath('/?view=list')).toBe('/login?next=%2F%3Fview%3Dlist');
  });
});

describe('isPublicAuthRoute', () => {
  it('recognises the login and register pages only', () => {
    expect(isPublicAuthRoute('/login')).toBe(true);
    expect(isPublicAuthRoute('/register')).toBe(true);
    expect(isPublicAuthRoute('/')).toBe(false);
  });
});
