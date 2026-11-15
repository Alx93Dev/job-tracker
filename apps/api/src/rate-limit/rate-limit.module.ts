import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { SharedRateLimitGuard } from './shared-rate-limit.guard';

@Global()
@Module({
  providers: [RateLimitService, { provide: APP_GUARD, useClass: SharedRateLimitGuard }],
  exports: [RateLimitService],
})
export class RateLimitModule {}
