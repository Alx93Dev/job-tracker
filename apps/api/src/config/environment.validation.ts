import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import {
  DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  DEFAULT_PORT,
  DEFAULT_REFRESH_TOKEN_TTL_DAYS,
  DEFAULT_TRUSTED_PROXY_HOPS,
  JWT_SECRET_MIN_LENGTH,
  MAX_PORT,
} from './app.constants';
import { DEFAULT_CLAUDE_MODEL } from '../ai/ai.constants';

function parseBooleanFlag(rawValue: unknown): boolean {
  return rawValue === true || rawValue === 'true';
}

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_PORT)
  PORT: number = DEFAULT_PORT;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsString()
  @MinLength(JWT_SECRET_MIN_LENGTH)
  JWT_ACCESS_SECRET!: string;

  @IsInt()
  @Min(1)
  ACCESS_TOKEN_TTL_SECONDS: number = DEFAULT_ACCESS_TOKEN_TTL_SECONDS;

  @IsInt()
  @Min(1)
  REFRESH_TOKEN_TTL_DAYS: number = DEFAULT_REFRESH_TOKEN_TTL_DAYS;

  // Implicit conversion turns the string "false" into `true` before this runs,
  // so the raw value is read from the source object instead.
  @Transform(({ obj }: { obj: Record<string, unknown> }) => parseBooleanFlag(obj.COOKIE_SECURE))
  @IsBoolean()
  COOKIE_SECURE: boolean = false;

  @IsInt()
  @Min(0)
  TRUSTED_PROXY_HOPS: number = DEFAULT_TRUSTED_PROXY_HOPS;

  @IsOptional()
  @IsEmail()
  DEMO_USER_EMAIL?: string;

  // An empty value (as copied from .env.example) means "AI disabled", not a startup error.
  @Transform(({ obj }: { obj: Record<string, unknown> }) => obj.ANTHROPIC_API_KEY || undefined)
  @IsOptional()
  @IsString()
  ANTHROPIC_API_KEY?: string;

  @IsString()
  @IsNotEmpty()
  ANTHROPIC_MODEL: string = DEFAULT_CLAUDE_MODEL;

  @IsOptional()
  @IsInt()
  @Min(1)
  GLOBAL_RATE_LIMIT_PER_MINUTE?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  AUTH_RATE_LIMIT_PER_MINUTE?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  AI_RATE_LIMIT_PER_MINUTE?: number;
}

export function validateEnvironment(rawConfig: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, rawConfig, {
    enableImplicitConversion: true,
  });
  const validationErrors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (validationErrors.length > 0) {
    throw new Error(`Invalid environment configuration: ${validationErrors.toString()}`);
  }

  return validatedConfig;
}
