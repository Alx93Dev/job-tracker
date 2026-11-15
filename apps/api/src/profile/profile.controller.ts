import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CvResponseDto } from './dto/cv-response.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiCookieAuth(ACCESS_TOKEN_COOKIE)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('cv')
  @ApiOkResponse({ type: CvResponseDto })
  getCv(@CurrentUser() currentUser: AuthenticatedUser): Promise<CvResponseDto> {
    return this.profileService.getCv(currentUser.id);
  }

  @Put('cv')
  @ApiOkResponse({ type: CvResponseDto })
  updateCv(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() updateCvDto: UpdateCvDto,
  ): Promise<CvResponseDto> {
    return this.profileService.updateCv(currentUser.id, updateCvDto.cvText);
  }
}
