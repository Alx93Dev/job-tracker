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
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { ListJobApplicationsQueryDto } from './dto/list-job-applications-query.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplicationsService } from './job-applications.service';

@ApiTags('job-applications')
@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Get()
  @ApiOkResponse({ type: JobApplicationResponseDto, isArray: true })
  findAll(@Query() query: ListJobApplicationsQueryDto): Promise<JobApplicationResponseDto[]> {
    return this.jobApplicationsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: JobApplicationResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: JobApplicationResponseDto })
  create(@Body() createDto: CreateJobApplicationDto): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.create(createDto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: JobApplicationResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.jobApplicationsService.remove(id);
  }
}
