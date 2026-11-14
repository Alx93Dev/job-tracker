import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { ListJobApplicationsQueryDto } from './dto/list-job-applications-query.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { jobApplicationResponseSelect, SEARCHABLE_FIELDS } from './job-applications.constants';

@Injectable()
export class JobApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    userId: string,
    query: ListJobApplicationsQueryDto,
  ): Promise<JobApplicationResponseDto[]> {
    return this.prisma.jobApplication.findMany({
      where: { userId, status: query.status, OR: this.buildSearchFilter(query.search) },
      orderBy: { updatedAt: 'desc' },
      select: jobApplicationResponseSelect,
    });
  }

  async findOne(userId: string, id: string): Promise<JobApplicationResponseDto> {
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      select: jobApplicationResponseSelect,
    });

    if (!jobApplication) {
      throw this.buildNotFoundException(id);
    }

    return jobApplication;
  }

  create(userId: string, createDto: CreateJobApplicationDto): Promise<JobApplicationResponseDto> {
    return this.prisma.jobApplication.create({
      data: { ...createDto, userId },
      select: jobApplicationResponseSelect,
    });
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    await this.assertOwnedByUser(userId, id);
    return this.prisma.jobApplication.update({
      where: { id },
      data: updateDto,
      select: jobApplicationResponseSelect,
    });
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
   * Applications owned by someone else answer 404 instead of 403, so the API does not
   * reveal which ids exist.
   */
  private async assertOwnedByUser(userId: string, id: string): Promise<void> {
    const ownedApplication = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!ownedApplication) {
      throw this.buildNotFoundException(id);
    }
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
