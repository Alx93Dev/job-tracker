import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;
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
