import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WORK_MODES } from '../schemas/extracted-job-posting.schema';

export class ExtractedJobPostingResponseDto {
  @ApiProperty()
  companyName!: string;

  @ApiProperty()
  positionTitle!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  location!: string | null;

  @ApiProperty({ enum: WORK_MODES })
  workMode!: (typeof WORK_MODES)[number];

  @ApiPropertyOptional({ nullable: true, type: String })
  salaryRange!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  seniority!: string | null;

  @ApiProperty({ type: [String] })
  requiredSkills!: string[];

  @ApiProperty({ type: [String] })
  niceToHaveSkills!: string[];

  @ApiProperty()
  summary!: string;
}
