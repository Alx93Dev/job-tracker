import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { hashToken } from './utils/hash-token';

const demoUser = { id: 'user-1', email: 'jane@example.com', name: 'Jane' };
const rawRefreshToken = 'raw-refresh-token';
const oneHourMs = 60 * 60 * 1000;

function buildStoredToken(overrides: Partial<{ revokedAt: Date | null; expiresAt: Date }> = {}) {
  return {
    id: 'token-1',
    userId: demoUser.id,
    expiresAt: new Date(Date.now() + oneHourMs),
    revokedAt: null,
    user: demoUser,
    ...overrides,
  };
}

describe('TokenService', () => {
  const refreshTokenRepository = {
    create: jest.fn<Promise<unknown>, [{ data: { tokenHash: string } }]>(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  };
  let tokenService: TokenService;

  beforeEach(async () => {
    jest.resetAllMocks();
    refreshTokenRepository.create.mockResolvedValue({});
    const testingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: PrismaService, useValue: { refreshToken: refreshTokenRepository } },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('jwt') } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(7) } },
      ],
    }).compile();
    tokenService = testingModule.get(TokenService);
  });

  it('stores only the hash of a newly issued refresh token', async () => {
    const tokens = await tokenService.issueTokens(demoUser);

    expect(tokens.accessToken).toBe('jwt');
    const storedData = refreshTokenRepository.create.mock.calls[0][0].data;
    expect(storedData.tokenHash).toBe(hashToken(tokens.refreshToken));
    expect(storedData.tokenHash).not.toBe(tokens.refreshToken);
  });

  it('rotates a valid refresh token: revokes it and issues a new pair', async () => {
    refreshTokenRepository.findUnique.mockResolvedValue(buildStoredToken());
    refreshTokenRepository.updateMany.mockResolvedValue({ count: 1 });

    const rotation = await tokenService.rotateRefreshToken(rawRefreshToken);

    expect(rotation.user).toEqual(demoUser);
    expect(refreshTokenRepository.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'token-1', revokedAt: null } }),
    );
    expect(rotation.tokens.refreshToken).not.toBe(rawRefreshToken);
  });

  it('revokes every session of the user when a rotated token is reused', async () => {
    refreshTokenRepository.findUnique.mockResolvedValue(
      buildStoredToken({ revokedAt: new Date() }),
    );

    await expect(tokenService.rotateRefreshToken(rawRefreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: demoUser.id, revokedAt: null } }),
    );
  });

  it('treats a lost race on rotation as reuse', async () => {
    refreshTokenRepository.findUnique.mockResolvedValue(buildStoredToken());
    refreshTokenRepository.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(tokenService.rotateRefreshToken(rawRefreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { userId: demoUser.id, revokedAt: null } }),
    );
  });

  it('rejects expired and unknown refresh tokens', async () => {
    refreshTokenRepository.findUnique.mockResolvedValueOnce(
      buildStoredToken({ expiresAt: new Date(Date.now() - oneHourMs) }),
    );
    await expect(tokenService.rotateRefreshToken(rawRefreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    refreshTokenRepository.findUnique.mockResolvedValueOnce(null);
    await expect(tokenService.rotateRefreshToken(rawRefreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });
});
