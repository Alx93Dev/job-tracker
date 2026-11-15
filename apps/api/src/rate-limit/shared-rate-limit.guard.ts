import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  SHARED_RATE_LIMIT_KEY,
  TOO_MANY_REQUESTS_MESSAGE,
  UNKNOWN_CLIENT_IP,
} from './rate-limit.constants';
import type { NamedRateLimitPolicy } from './rate-limit-policy';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class SharedRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.get<NamedRateLimitPolicy | undefined>(
      SHARED_RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!policy) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    // `request.ip` honours the trusted proxy hops set in main.ts, so it is the client's
    // address and not the address of the proxy in front of the API.
    const decision = await this.rateLimitService.consume(
      policy,
      request.ip ?? UNKNOWN_CLIENT_IP,
      new Date(),
    );

    if (!decision.isAllowed) {
      http.getResponse<Response>().setHeader('Retry-After', String(decision.retryAfterSeconds));
      throw new HttpException(TOO_MANY_REQUESTS_MESSAGE, HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
