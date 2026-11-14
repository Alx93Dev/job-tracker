import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../auth.constants';
import { normalizeEmail } from '../utils/normalize-email';

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(({ value }: { value: unknown }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
