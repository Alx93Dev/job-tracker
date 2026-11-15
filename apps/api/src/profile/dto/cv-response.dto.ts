import { ApiPropertyOptional } from '@nestjs/swagger';

export class CvResponseDto {
  @ApiPropertyOptional({ nullable: true, type: String })
  cvText!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Date })
  cvUpdatedAt!: Date | null;
}
