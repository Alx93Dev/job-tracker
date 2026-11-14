import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import type { TokenService } from '../token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

function buildContext(request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const tokenService = { verifyAccessToken: jest.fn() };
  const guard = new JwtAuthGuard(
    reflector as unknown as Reflector,
    tokenService as unknown as TokenService,
  );

  beforeEach(() => jest.resetAllMocks());

  it('lets public routes through without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(buildContext({ cookies: {} }))).resolves.toBe(true);
  });

  it('rejects protected routes without an access token cookie', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(buildContext({ cookies: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects invalid or expired access tokens', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokenService.verifyAccessToken.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(buildContext({ cookies: { [ACCESS_TOKEN_COOKIE]: 'expired' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the authenticated user to the request', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    tokenService.verifyAccessToken.mockResolvedValue({ sub: 'user-1', email: 'jane@example.com' });
    const request: Record<string, unknown> = { cookies: { [ACCESS_TOKEN_COOKIE]: 'valid' } };

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', email: 'jane@example.com' });
  });
});
