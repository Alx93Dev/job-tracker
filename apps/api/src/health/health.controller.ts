import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './health-response.dto';

const DATABASE_UNAVAILABLE_MESSAGE = 'Database is not reachable';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Used by the hosting platform to decide whether the instance can receive traffic. */
  @Public()
  @SkipThrottle()
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiServiceUnavailableResponse()
  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException(DATABASE_UNAVAILABLE_MESSAGE);
    }
    return { status: 'ok', database: 'up' };
  }
}
