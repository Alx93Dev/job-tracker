import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class FunnelStageDto {
  @ApiProperty({ enum: ApplicationStatus })
  stage!: ApplicationStatus;

  @ApiProperty()
  count!: number;
}
