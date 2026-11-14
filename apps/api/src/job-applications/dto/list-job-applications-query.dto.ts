import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JOB_APPLICATION_LIMITS } from '../job-applications.constants';

export class ListJobApplicationsQueryDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Matches company, position or location' })
  @IsOptional()
  @IsString()
  @MaxLength(JOB_APPLICATION_LIMITS.shortTextMaxLength)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;
}
