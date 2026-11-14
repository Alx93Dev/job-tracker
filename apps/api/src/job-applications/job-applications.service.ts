import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { ListJobApplicationsQueryDto } from './dto/list-job-applications-query.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import {
  jobApplicationResponseSelect,
  PRISMA_RECORD_NOT_FOUND_CODE,
} from './job-applications.constants';

@Injectable()
export class JobApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListJobApplicationsQueryDto): Promise<JobApplicationResponseDto[]> {
    return this.prisma.jobApplication.findMany({
      where: { status: query.status },
      orderBy: { updatedAt: 'desc' },
      select: jobApplicationResponseSelect,
    });
  }

  async findOne(id: string): Promise<JobApplicationResponseDto> {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { id },
      select: jobApplicationResponseSelect,
    });

    if (!jobApplication) {
      throw this.buildNotFoundException(id);
    }

    return jobApplication;
  }

  create(createDto: CreateJobApplicationDto): Promise<JobApplicationResponseDto> {
    return this.prisma.jobApplication.create({
      data: createDto,
      select: jobApplicationResponseSelect,
    });
  }

  async update(id: string, updateDto: UpdateJobApplicationDto): Promise<JobApplicationResponseDto> {
    try {
      return await this.prisma.jobApplication.update({
        where: { id },
        data: updateDto,
        select: jobApplicationResponseSelect,
      });
    } catch (error) {
      throw this.mapPrismaError(error, id);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.jobApplication.delete({ where: { id } });
    } catch (error) {
      throw this.mapPrismaError(error, id);
    }
  }

  private mapPrismaError(error: unknown, id: string): unknown {
    const isRecordNotFound =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_RECORD_NOT_FOUND_CODE;

    return isRecordNotFound ? this.buildNotFoundException(id) : error;
  }

  private buildNotFoundException(id: string): NotFoundException {
    return new NotFoundException(`Job application ${id} not found`);
  }
}
