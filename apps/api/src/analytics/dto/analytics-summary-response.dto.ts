import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { FunnelStageDto } from './funnel-stage.dto';
import { FollowUpSummaryDto } from './follow-up-summary.dto';
import { WeeklyActivityDto } from './weekly-activity.dto';

export class AnalyticsSummaryResponseDto {
  @ApiProperty()
  totalApplications!: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { WISHLIST: 2, APPLIED: 5, INTERVIEW: 1, OFFER: 0, REJECTED: 2 },
  })
  countsByStatus!: Record<ApplicationStatus, number>;

  @ApiProperty({ description: 'Applications that were sent (reached APPLIED or later)' })
  appliedCount!: number;

  @ApiProperty({ description: 'Applied applications that got an interview, offer or rejection' })
  respondedCount!: number;

  @ApiPropertyOptional({ nullable: true, type: Number, description: 'Fraction from 0 to 1' })
  responseRate!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number, description: 'Fraction from 0 to 1' })
  interviewRate!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number, description: 'Fraction from 0 to 1' })
  offerRate!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  averageDaysToFirstResponse!: number | null;

  @ApiProperty({ type: [FunnelStageDto] })
  funnel!: FunnelStageDto[];

  @ApiProperty({ type: [WeeklyActivityDto] })
  weeklyApplications!: WeeklyActivityDto[];

  @ApiProperty({ type: FollowUpSummaryDto })
  followUps!: FollowUpSummaryDto;
}
