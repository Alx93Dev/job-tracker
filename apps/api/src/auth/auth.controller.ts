import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AUTH_RATE_LIMIT } from '../config/rate-limits';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { AuthenticatedUser } from './types/authenticated-user';
import type { AuthenticationResult } from './types/authentication-result';

function readRefreshToken(request: Request): string | undefined {
  return (request.cookies as Record<string, string | undefined>)[REFRESH_TOKEN_COOKIE];
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: AUTH_RATE_LIMIT })
  @Post('register')
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiTooManyRequestsResponse()
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    return this.startSession(response, await this.authService.register(registerDto));
  }

  @Public()
  @Throttle({ default: AUTH_RATE_LIMIT })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiTooManyRequestsResponse()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    return this.startSession(response, await this.authService.login(loginDto));
  }

  @Public()
  @Throttle({ default: AUTH_RATE_LIMIT })
  @Post('demo')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  async loginAsDemoUser(@Res({ passthrough: true }) response: Response): Promise<UserResponseDto> {
    return this.startSession(response, await this.authService.loginAsDemoUser());
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    try {
      return this.startSession(response, await this.authService.refresh(readRefreshToken(request)));
    } catch (error) {
      this.authCookieService.clearAuthCookies(response);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(readRefreshToken(request));
    this.authCookieService.clearAuthCookies(response);
  }

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() currentUser: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.getProfile(currentUser.id);
  }

  private startSession(
    response: Response,
    authenticationResult: AuthenticationResult,
  ): UserResponseDto {
    this.authCookieService.setAuthCookies(response, authenticationResult.tokens);
    return authenticationResult.user;
  }
}
