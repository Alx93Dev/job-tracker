import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AI_RATE_LIMIT } from '../config/rate-limits';
import { ACCESS_TOKEN_COOKIE } from '../auth/auth.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { ListJobApplicationsQueryDto } from './dto/list-job-applications-query.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplicationsService } from './job-applications.service';

@ApiTags('job-applications')
@ApiCookieAuth(ACCESS_TOKEN_COOKIE)
@ApiUnauthorizedResponse()
@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Get()
  @ApiOkResponse({ type: JobApplicationResponseDto, isArray: true })
  findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListJobApplicationsQueryDto,
  ): Promise<JobApplicationResponseDto[]> {
    return this.jobApplicationsService.findAll(currentUser.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: JobApplicationResponseDto })
  findOne(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.findOne(currentUser.id, id);
  }

  @Post()
  @ApiCreatedResponse({ type: JobApplicationResponseDto })
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() createDto: CreateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.create(currentUser.id, createDto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: JobApplicationResponseDto })
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.update(currentUser.id, id, updateDto);
  }

  @Throttle({ default: AI_RATE_LIMIT })
  @Post(':id/cv-match')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: JobApplicationResponseDto })
  @ApiUnprocessableEntityResponse({ description: 'Missing job description or CV' })
  matchWithCv(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.matchWithCv(currentUser.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.jobApplicationsService.remove(currentUser.id, id);
  }
}
