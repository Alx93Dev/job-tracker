import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class JobApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyName!: string;

  @ApiProperty()
  positionTitle!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  jobUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  salaryRange!: string | null;

  @ApiProperty({ enum: ApplicationStatus })
  status!: ApplicationStatus;

  @ApiPropertyOptional({ nullable: true, type: Date })
  appliedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
