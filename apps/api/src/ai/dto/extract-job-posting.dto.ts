import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AI_INPUT_LIMITS } from '../ai.constants';

export class ExtractJobPostingDto {
  @ApiProperty({ description: 'Job posting text copied from a job board' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(AI_INPUT_LIMITS.jobPostingMaxLength)
  postingText!: string;
}
