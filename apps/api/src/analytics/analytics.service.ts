import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeAnalyticsSummary } from './compute-analytics-summary';
import { AnalyticsSummaryResponseDto } from './dto/analytics-summary-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string): Promise<AnalyticsSummaryResponseDto> {
    const applications = await this.prisma.jobApplication.findMany({
      where: { userId },
      select: {
        status: true,
        appliedAt: true,
        followUpAt: true,
        statusChanges: {
          select: { fromStatus: true, toStatus: true, changedAt: true },
          orderBy: { changedAt: 'asc' },
        },
      },
    });
    return computeAnalyticsSummary(applications, new Date());
  }
}
