import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { EnvironmentVariables } from '../config/environment.validation';
import { AUTH_ERROR_MESSAGES, MILLISECONDS_PER_DAY, REFRESH_TOKEN_BYTES } from './auth.constants';
import type { AuthenticationResult } from './types/authentication-result';
import type { AccessTokenPayload } from './types/access-token-payload';
import type { AuthenticatedUser } from './types/authenticated-user';
import type { IssuedTokens } from './types/issued-tokens';
import { userResponseSelect } from './user-response.select';
import { hashToken } from './utils/hash-token';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async issueTokens(user: AuthenticatedUser): Promise<IssuedTokens> {
    const accessTokenPayload: AccessTokenPayload = { sub: user.id, email: user.email };
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const refreshTokenLifetimeMs =
      this.configService.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }) * MILLISECONDS_PER_DAY;

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(accessTokenPayload),
      refreshToken,
    };
  }

  verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);
  }

  /**
   * Refresh tokens are single use. Presenting one that was already rotated means it was
   * copied (or replayed by an attacker), so every session of that user is revoked.
   */
  async rotateRefreshToken(rawRefreshToken: string): Promise<AuthenticationResult> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawRefreshToken) },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        user: { select: userResponseSelect },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }

    if (storedToken.revokedAt) {
      await this.revokeAllUserTokens(storedToken.userId);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }

    const { count: revokedCount } = await this.prisma.refreshToken.updateMany({
      where: { id: storedToken.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (revokedCount === 0) {
      await this.revokeAllUserTokens(storedToken.userId);
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }

    return {
      user: storedToken.user,
      tokens: await this.issueTokens(storedToken.user),
    };
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
