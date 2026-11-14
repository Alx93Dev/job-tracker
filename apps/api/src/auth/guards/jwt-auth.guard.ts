import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_COOKIE, AUTH_ERROR_MESSAGES, IS_PUBLIC_ROUTE_KEY } from '../auth.constants';
import { TokenService } from '../token.service';
import type { AccessTokenPayload } from '../types/access-token-payload';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = (request.cookies as Record<string, string | undefined>)[
      ACCESS_TOKEN_COOKIE
    ];
    if (!accessToken) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.notAuthenticated);
    }

    const payload = await this.verifyOrReject(accessToken);
    request.user = { id: payload.sub, email: payload.email };
    return true;
  }

  private async verifyOrReject(accessToken: string): Promise<AccessTokenPayload> {
    try {
      return await this.tokenService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }
  }
}
