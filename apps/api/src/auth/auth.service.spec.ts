import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { PrismaService } from '../prisma/prisma.service';
import { PRISMA_UNIQUE_CONSTRAINT_CODE } from './auth.constants';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

const issuedTokens = { accessToken: 'access', refreshToken: 'refresh' };
const storedUser = { id: 'user-1', email: 'jane@example.com', name: 'Jane' };
const correctPassword = 'correct horse battery staple';

describe('AuthService', () => {
  const userRepository = {
    create: jest.fn<Promise<unknown>, [{ data: { passwordHash: string } }]>(),
    findUnique: jest.fn(),
  };
  const tokenService = { issueTokens: jest.fn(), rotateRefreshToken: jest.fn() };
  const configService = { get: jest.fn() };
  let authService: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    tokenService.issueTokens.mockResolvedValue(issuedTokens);
    const testingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: { user: userRepository } },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    authService = testingModule.get(AuthService);
    await authService.onModuleInit();
  });

  it('registers a user with a hashed password and starts a session', async () => {
    userRepository.create.mockResolvedValue(storedUser);

    const result = await authService.register({
      email: storedUser.email,
      password: correctPassword,
    });

    expect(result).toEqual({ user: storedUser, tokens: issuedTokens });
    const savedPasswordHash = userRepository.create.mock.calls[0][0].data.passwordHash;
    expect(savedPasswordHash).toMatch(/^\$argon2id\$/);
    expect(savedPasswordHash).not.toContain(correctPassword);
  });

  it('rejects registration with an email that is already taken', async () => {
    userRepository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: PRISMA_UNIQUE_CONSTRAINT_CODE,
        clientVersion: 'test',
      }),
    );

    await expect(
      authService.register({ email: storedUser.email, password: correctPassword }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials without leaking the password hash', async () => {
    userRepository.findUnique.mockResolvedValue({
      ...storedUser,
      passwordHash: await hash(correctPassword),
    });

    const result = await authService.login({ email: storedUser.email, password: correctPassword });

    expect(result.user).toEqual(storedUser);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    userRepository.findUnique.mockResolvedValueOnce({
      ...storedUser,
      passwordHash: await hash(correctPassword),
    });
    const wrongPasswordError = await authService
      .login({ email: storedUser.email, password: 'wrong password' })
      .catch((error: unknown) => error);

    userRepository.findUnique.mockResolvedValueOnce(null);
    const unknownEmailError = await authService
      .login({ email: 'nobody@example.com', password: 'wrong password' })
      .catch((error: unknown) => error);

    expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
    expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
    expect((wrongPasswordError as Error).message).toBe((unknownEmailError as Error).message);
    expect(tokenService.issueTokens).not.toHaveBeenCalled();
  });

  it('logs into the demo account only when it is configured', async () => {
    configService.get.mockReturnValueOnce(undefined);
    await expect(authService.loginAsDemoUser()).rejects.toBeInstanceOf(NotFoundException);

    configService.get.mockReturnValueOnce('demo@jobtracker.dev');
    userRepository.findUnique.mockResolvedValueOnce(storedUser);
    await expect(authService.loginAsDemoUser()).resolves.toEqual({
      user: storedUser,
      tokens: issuedTokens,
    });
  });

  it('refuses to refresh without a refresh token', () => {
    expect(() => authService.refresh(undefined)).toThrow(UnauthorizedException);
  });
});
