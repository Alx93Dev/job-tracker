import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { JOB_APPLICATION_LIMITS } from '../job-applications.constants';

export class CreateJobApplicationDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(JOB_APPLICATION_LIMITS.shortTextMaxLength)
  companyName!: string;

  @ApiProperty({ example: 'Frontend Developer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(JOB_APPLICATION_LIMITS.shortTextMaxLength)
  positionTitle!: string;

  @ApiPropertyOptional({ example: 'https://acme.example/jobs/42' })
  @IsOptional()
  @IsUrl()
  @MaxLength(JOB_APPLICATION_LIMITS.urlMaxLength)
  jobUrl?: string;

  @ApiPropertyOptional({ example: 'Remote' })
  @IsOptional()
  @IsString()
  @MaxLength(JOB_APPLICATION_LIMITS.shortTextMaxLength)
  location?: string;

  @ApiPropertyOptional({ example: '35k - 42k' })
  @IsOptional()
  @IsString()
  @MaxLength(JOB_APPLICATION_LIMITS.shortTextMaxLength)
  salaryRange?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.WISHLIST })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: '2026-11-03' })
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(JOB_APPLICATION_LIMITS.notesMaxLength)
  notes?: string;
}
