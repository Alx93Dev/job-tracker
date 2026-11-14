import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import type { EnvironmentVariables } from '../config/environment.validation';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES, PRISMA_UNIQUE_CONSTRAINT_CODE } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { TokenService } from './token.service';
import type { AuthenticationResult } from './types/authentication-result';
import { userResponseSelect } from './user-response.select';

@Injectable()
export class AuthService implements OnModuleInit {
  private timingSafeDummyHash = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  /**
   * Verifying against a dummy hash when the email does not exist keeps login response
   * times similar, so attackers cannot use timing to discover registered emails.
   */
  async onModuleInit(): Promise<void> {
    this.timingSafeDummyHash = await hash(randomBytes(32).toString('hex'));
  }

  async register(registerDto: RegisterDto): Promise<AuthenticationResult> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          passwordHash: await hash(registerDto.password),
        },
        select: userResponseSelect,
      });
      return { user, tokens: await this.tokenService.issueTokens(user) };
    } catch (error) {
      const isDuplicateEmail =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_UNIQUE_CONSTRAINT_CODE;
      throw isDuplicateEmail ? new ConflictException(AUTH_ERROR_MESSAGES.emailTaken) : error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthenticationResult> {
    const userWithPassword = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: { ...userResponseSelect, passwordHash: true },
    });

    const isPasswordValid = await verify(
      userWithPassword?.passwordHash ?? this.timingSafeDummyHash,
      loginDto.password,
    );

    if (!userWithPassword || !isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidCredentials);
    }

    const user = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
    };
    return { user, tokens: await this.tokenService.issueTokens(user) };
  }

  async loginAsDemoUser(): Promise<AuthenticationResult> {
    const demoUserEmail = this.configService.get('DEMO_USER_EMAIL', { infer: true });
    const demoUser = demoUserEmail
      ? await this.prisma.user.findUnique({
          where: { email: demoUserEmail },
          select: userResponseSelect,
        })
      : null;

    if (!demoUser) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.demoUnavailable);
    }

    return { user: demoUser, tokens: await this.tokenService.issueTokens(demoUser) };
  }

  refresh(rawRefreshToken?: string): Promise<AuthenticationResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.sessionExpired);
    }
    return this.tokenService.rotateRefreshToken(rawRefreshToken);
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      await this.tokenService.revokeRefreshToken(rawRefreshToken);
    }
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userResponseSelect,
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.notAuthenticated);
    }

    return user;
  }
}
