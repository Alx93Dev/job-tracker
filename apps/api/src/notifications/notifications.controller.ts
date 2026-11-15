import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NotificationListResponseDto } from './dto/notification-list-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth(ACCESS_TOKEN_COOKIE)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ type: NotificationListResponseDto })
  list(@CurrentUser() currentUser: AuthenticatedUser): Promise<NotificationListResponseDto> {
    return this.notificationsService.list(currentUser.id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  markAllAsRead(@CurrentUser() currentUser: AuthenticatedUser): Promise<void> {
    return this.notificationsService.markAllAsRead(currentUser.id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  markAsRead(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.notificationsService.markAsRead(currentUser.id, id);
  }
}
