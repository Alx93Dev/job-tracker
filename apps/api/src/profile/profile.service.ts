import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CvResponseDto } from './dto/cv-response.dto';

const cvSelect = { cvText: true, cvUpdatedAt: true } as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getCv(userId: string): Promise<CvResponseDto> {
    const cv = await this.prisma.user.findUnique({ where: { id: userId }, select: cvSelect });
    if (!cv) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.notAuthenticated);
    }
    return cv;
  }

  updateCv(userId: string, rawCvText: string): Promise<CvResponseDto> {
    const cvText = rawCvText.trim() || null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { cvText, cvUpdatedAt: cvText ? new Date() : null },
      select: cvSelect,
    });
  }
}
