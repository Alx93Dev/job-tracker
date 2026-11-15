import { ApiProperty } from '@nestjs/swagger';

export class FollowUpSummaryDto {
  @ApiProperty({ description: 'Open applications whose follow-up date has passed' })
  overdue!: number;

  @ApiProperty({ description: 'Open applications with a follow-up date still ahead' })
  upcoming!: number;
}
