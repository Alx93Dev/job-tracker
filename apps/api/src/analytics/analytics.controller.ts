import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AnalyticsService } from './analytics.service';
import { AnalyticsSummaryResponseDto } from './dto/analytics-summary-response.dto';

@ApiTags('analytics')
@ApiCookieAuth(ACCESS_TOKEN_COOKIE)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  getSummary(@CurrentUser() currentUser: AuthenticatedUser): Promise<AnalyticsSummaryResponseDto> {
    return this.analyticsService.getSummary(currentUser.id);
  }
}
