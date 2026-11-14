import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { jobApplicationResponseSelect } from './job-applications.constants';
import { JobApplicationsService } from './job-applications.service';

const ownerUserId = 'owner-user-id';
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

describe('JobApplicationsService', () => {
  const jobApplicationRepository = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
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

  it('lists only the current user applications, filtered by status', async () => {
    jobApplicationRepository.findMany.mockResolvedValue([storedApplication]);

    const applications = await service.findAll(ownerUserId, { status: ApplicationStatus.APPLIED });

    expect(applications).toEqual([storedApplication]);
    expect(jobApplicationRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: ownerUserId, status: ApplicationStatus.APPLIED, OR: undefined },
        select: jobApplicationResponseSelect,
      }),
    );
  });

  it('searches company, position and location case-insensitively', async () => {
    jobApplicationRepository.findMany.mockResolvedValue([]);

    await service.findAll(ownerUserId, { search: 'acme' });

    const containsAcme = { contains: 'acme', mode: Prisma.QueryMode.insensitive };
    expect(jobApplicationRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: ownerUserId,
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

  it('assigns new applications to the current user', async () => {
    jobApplicationRepository.create.mockResolvedValue(storedApplication);

    await service.create(ownerUserId, { companyName: 'Acme', positionTitle: 'Dev' });

    expect(jobApplicationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { companyName: 'Acme', positionTitle: 'Dev', userId: ownerUserId },
      }),
    );
  });

  it('returns an application owned by the current user', async () => {
    jobApplicationRepository.findFirst.mockResolvedValue(storedApplication);

    await expect(service.findOne(ownerUserId, existingApplicationId)).resolves.toEqual(
      storedApplication,
    );
    expect(jobApplicationRepository.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: existingApplicationId, userId: ownerUserId } }),
    );
  });

  it('answers 404 for applications that do not belong to the current user', async () => {
    jobApplicationRepository.findFirst.mockResolvedValue(null);

    await expect(service.findOne('other-user', existingApplicationId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('does not update applications owned by another user', async () => {
    jobApplicationRepository.findFirst.mockResolvedValue(null);

    await expect(
      service.update('other-user', existingApplicationId, { status: ApplicationStatus.OFFER }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(jobApplicationRepository.update).not.toHaveBeenCalled();
  });

  it('updates applications owned by the current user', async () => {
    jobApplicationRepository.findFirst.mockResolvedValue({ id: existingApplicationId });
    jobApplicationRepository.update.mockResolvedValue({
      ...storedApplication,
      status: ApplicationStatus.OFFER,
    });

    const updatedApplication = await service.update(ownerUserId, existingApplicationId, {
      status: ApplicationStatus.OFFER,
    });

    expect(updatedApplication.status).toBe(ApplicationStatus.OFFER);
  });

  it('deletes only within the current user scope', async () => {
    jobApplicationRepository.deleteMany.mockResolvedValue({ count: 1 });

    await service.remove(ownerUserId, existingApplicationId);

    expect(jobApplicationRepository.deleteMany).toHaveBeenCalledWith({
      where: { id: existingApplicationId, userId: ownerUserId },
    });
  });

  it('answers 404 when there is nothing to delete for the current user', async () => {
    jobApplicationRepository.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.remove('other-user', existingApplicationId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
