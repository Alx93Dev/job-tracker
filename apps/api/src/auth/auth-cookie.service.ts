import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import type { EnvironmentVariables } from '../config/environment.validation';
import {
  ACCESS_TOKEN_COOKIE,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants';
import type { IssuedTokens } from './types/issued-tokens';

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {}

  setAuthCookies(response: Response, tokens: IssuedTokens): void {
    const accessTokenLifetimeMs =
      this.configService.get('ACCESS_TOKEN_TTL_SECONDS', { infer: true }) * MILLISECONDS_PER_SECOND;
    const refreshTokenLifetimeMs =
      this.configService.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }) * MILLISECONDS_PER_DAY;

    response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...this.baseCookieOptions(),
      maxAge: accessTokenLifetimeMs,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...this.baseCookieOptions(),
      maxAge: refreshTokenLifetimeMs,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.baseCookieOptions());
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.baseCookieOptions());
  }

  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('COOKIE_SECURE', { infer: true }),
      path: '/',
    };
  }
}
