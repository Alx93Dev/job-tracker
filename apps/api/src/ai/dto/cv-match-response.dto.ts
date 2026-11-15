import { ApiProperty } from '@nestjs/swagger';
import { MATCH_VERDICTS } from '../schemas/cv-match.schema';

export class CvMatchResponseDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  matchScore!: number;

  @ApiProperty({ enum: MATCH_VERDICTS })
  verdict!: (typeof MATCH_VERDICTS)[number];

  @ApiProperty({ type: [String] })
  strengths!: string[];

  @ApiProperty({ type: [String] })
  gaps!: string[];

  @ApiProperty({ type: [String] })
  talkingPoints!: string[];

  @ApiProperty()
  summary!: string;
}
