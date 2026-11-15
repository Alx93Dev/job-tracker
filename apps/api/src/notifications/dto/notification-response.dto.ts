import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  jobApplicationId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Date })
  readAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
