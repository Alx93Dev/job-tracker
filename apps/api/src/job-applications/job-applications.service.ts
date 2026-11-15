import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { ListJobApplicationsQueryDto } from './dto/list-job-applications-query.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { toJobApplicationResponse } from './job-application-response.mapper';
import {
  CV_MATCH_ERROR_MESSAGES,
  jobApplicationResponseSelect,
  SEARCHABLE_FIELDS,
} from './job-applications.constants';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async findAll(
    userId: string,
    query: ListJobApplicationsQueryDto,
  ): Promise<JobApplicationResponseDto[]> {
    const records = await this.prisma.jobApplication.findMany({
      where: { userId, status: query.status, OR: this.buildSearchFilter(query.search) },
      orderBy: { updatedAt: 'desc' },
      select: jobApplicationResponseSelect,
    });
    return records.map(toJobApplicationResponse);
  }

  async findOne(userId: string, id: string): Promise<JobApplicationResponseDto> {
    const record = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      select: jobApplicationResponseSelect,
    });

    if (!record) {
      throw this.buildNotFoundException(id);
    }

    return toJobApplicationResponse(record);
  }

  async create(
    userId: string,
    createDto: CreateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    const record = await this.prisma.jobApplication.create({
      data: { ...createDto, userId },
      select: jobApplicationResponseSelect,
    });
    return toJobApplicationResponse(record);
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    const currentRecord = await this.findOwnedRecord(userId, id);
    const isJobDescriptionChanged =
      updateDto.jobDescription !== undefined &&
      updateDto.jobDescription !== currentRecord.jobDescription;

    const record = await this.prisma.jobApplication.update({
      where: { id },
      data: {
        ...updateDto,
        ...(isJobDescriptionChanged && { cvMatch: Prisma.DbNull, cvMatchedAt: null }),
      },
      select: jobApplicationResponseSelect,
    });
    return toJobApplicationResponse(record);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count: deletedCount } = await this.prisma.jobApplication.deleteMany({
      where: { id, userId },
    });

    if (deletedCount === 0) {
      throw this.buildNotFoundException(id);
    }
  }

  /**
   * The match is stored on the application so reopening it does not call (and pay for)
   * the model again. It is cleared whenever the job description changes.
   */
  async matchWithCv(userId: string, id: string): Promise<JobApplicationResponseDto> {
    const [application, user] = await Promise.all([
      this.findOwnedRecord(userId, id),
      this.prisma.user.findUnique({ where: { id: userId }, select: { cvText: true } }),
    ]);

    if (!application.jobDescription) {
      throw new UnprocessableEntityException(CV_MATCH_ERROR_MESSAGES.missingJobDescription);
    }
    if (!user?.cvText) {
      throw new UnprocessableEntityException(CV_MATCH_ERROR_MESSAGES.missingCv);
    }

    const cvMatch = await this.aiService.matchCv({
      cvText: user.cvText,
      positionTitle: application.positionTitle,
      companyName: application.companyName,
      jobDescription: application.jobDescription,
    });

    const record = await this.prisma.jobApplication.update({
      where: { id },
      data: { cvMatch, cvMatchedAt: new Date() },
      select: jobApplicationResponseSelect,
    });
    return toJobApplicationResponse(record);
  }

  /**
   * Applications owned by someone else answer 404 instead of 403, so the API does not
   * reveal which ids exist.
   */
  private async findOwnedRecord(userId: string, id: string) {
    const record = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      select: jobApplicationResponseSelect,
    });

    if (!record) {
      throw this.buildNotFoundException(id);
    }

    return record;
  }

  private buildSearchFilter(search?: string): Prisma.JobApplicationWhereInput[] | undefined {
    if (!search) {
      return undefined;
    }

    const containsSearch = { contains: search, mode: Prisma.QueryMode.insensitive };
    return SEARCHABLE_FIELDS.map((field) => ({ [field]: containsSearch }));
  }

  private buildNotFoundException(id: string): NotFoundException {
    return new NotFoundException(`Job application ${id} not found`);
  }
}
