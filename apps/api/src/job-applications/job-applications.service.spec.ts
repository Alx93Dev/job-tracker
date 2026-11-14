import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobApplicationsService } from './job-applications.service';
import {
  jobApplicationResponseSelect,
  PRISMA_RECORD_NOT_FOUND_CODE,
} from './job-applications.constants';

const existingApplicationId = '7b1f6a3e-2c4d-4e5f-8a9b-0c1d2e3f4a5b';

const storedApplication = {
  id: existingApplicationId,
  companyName: 'Acme Corp',
  positionTitle: 'Frontend Developer',
  jobUrl: null,
  location: 'Remote',
  salaryRange: null,
  status: ApplicationStatus.APPLIED,
  appliedAt: new Date('2026-11-03'),
  notes: null,
  createdAt: new Date('2026-11-03'),
  updatedAt: new Date('2026-11-03'),
};

function buildRecordNotFoundError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: PRISMA_RECORD_NOT_FOUND_CODE,
    clientVersion: 'test',
  });
}

describe('JobApplicationsService', () => {
  const jobApplicationRepository = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  let service: JobApplicationsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const testingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        { provide: PrismaService, useValue: { jobApplication: jobApplicationRepository } },
      ],
    }).compile();
    service = testingModule.get(JobApplicationsService);
  });

  it('filters by status and projects only the response fields', async () => {
    jobApplicationRepository.findMany.mockResolvedValue([storedApplication]);

    const applications = await service.findAll({ status: ApplicationStatus.APPLIED });

    expect(applications).toEqual([storedApplication]);
    expect(jobApplicationRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: ApplicationStatus.APPLIED },
        select: jobApplicationResponseSelect,
      }),
    );
  });

  it('searches company, position and location case-insensitively', async () => {
    jobApplicationRepository.findMany.mockResolvedValue([]);

    await service.findAll({ search: 'acme' });

    const containsAcme = { contains: 'acme', mode: Prisma.QueryMode.insensitive };
    expect(jobApplicationRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: undefined,
          OR: [
            { companyName: containsAcme },
            { positionTitle: containsAcme },
            { location: containsAcme },
          ],
        },
      }),
    );
  });

  it('does not add a search filter when search is empty', async () => {
    jobApplicationRepository.findMany.mockResolvedValue([]);

    await service.findAll({ search: '' });

    expect(jobApplicationRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: undefined, OR: undefined } }),
    );
  });

  it('returns the application when it exists', async () => {
    jobApplicationRepository.findUnique.mockResolvedValue(storedApplication);

    await expect(service.findOne(existingApplicationId)).resolves.toEqual(storedApplication);
  });

  it('throws NotFoundException when the application does not exist', async () => {
    jobApplicationRepository.findUnique.mockResolvedValue(null);

    await expect(service.findOne(existingApplicationId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps a missing record on update to NotFoundException', async () => {
    jobApplicationRepository.update.mockRejectedValue(buildRecordNotFoundError());

    await expect(
      service.update(existingApplicationId, { status: ApplicationStatus.OFFER }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps a missing record on delete to NotFoundException', async () => {
    jobApplicationRepository.delete.mockRejectedValue(buildRecordNotFoundError());

    await expect(service.remove(existingApplicationId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rethrows unexpected database errors unchanged', async () => {
    const connectionError = new Error('Connection lost');
    jobApplicationRepository.delete.mockRejectedValue(connectionError);

    await expect(service.remove(existingApplicationId)).rejects.toBe(connectionError);
  });
});
