import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { AI_RATE_LIMIT } from '../config/rate-limits';
import { SharedRateLimit } from '../rate-limit/shared-rate-limit.decorator';
import { AiService } from './ai.service';
import { ExtractJobPostingDto } from './dto/extract-job-posting.dto';
import { ExtractedJobPostingResponseDto } from './dto/extracted-job-posting-response.dto';

@ApiTags('ai')
@ApiCookieAuth(ACCESS_TOKEN_COOKIE)
@ApiTooManyRequestsResponse()
@ApiServiceUnavailableResponse({ description: 'AI is not configured or the provider is busy' })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @SharedRateLimit('ai:extract-job-posting', AI_RATE_LIMIT)
  @Post('job-postings/extract')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ExtractedJobPostingResponseDto })
  extractJobPosting(
    @Body() extractDto: ExtractJobPostingDto,
  ): Promise<ExtractedJobPostingResponseDto> {
    return this.aiService.extractJobPosting(extractDto.postingText);
  }
}
