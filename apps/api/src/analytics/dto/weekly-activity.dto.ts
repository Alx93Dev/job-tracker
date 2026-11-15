import { ApiProperty } from '@nestjs/swagger';

export class WeeklyActivityDto {
  @ApiProperty({ example: '2026-11-09', description: 'Monday that starts the week (UTC)' })
  weekStart!: string;

  @ApiProperty()
  count!: number;
}
