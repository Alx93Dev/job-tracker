import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { AI_INPUT_LIMITS } from '../../ai/ai.constants';

export class UpdateCvDto {
  @ApiProperty({ description: 'CV as plain text. An empty string removes it.' })
  @IsString()
  @MaxLength(AI_INPUT_LIMITS.cvMaxLength)
  cvText!: string;
}
