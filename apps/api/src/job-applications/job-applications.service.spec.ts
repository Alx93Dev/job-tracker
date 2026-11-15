import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import type { CvMatch } from '../ai/schemas/cv-match.schema';
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
  followUpAt: null,
  jobDescription: 'We need React and TypeScript',
  cvMatch: null,
  cvMatchedAt: null,
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
  const userRepository = { findUnique: jest.fn() };
  const aiService = { matchCv: jest.fn() };
  let service: JobApplicationsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const testingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: PrismaService,
          useValue: { jobApplication: jobApplicationRepository, user: userRepository },
        },
        { provide: AiService, useValue: aiService },
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
        data: {
          companyName: 'Acme',
          positionTitle: 'Dev',
          userId: ownerUserId,
          statusChanges: {
            create: expect.objectContaining({
              fromStatus: null,
              toStatus: ApplicationStatus.WISHLIST,
            }) as unknown,
          },
        },
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
    jobApplicationRepository.findFirst.mockResolvedValue(storedApplication);
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

  describe('CV match', () => {
    const cvMatch: CvMatch = {
      matchScore: 70,
      verdict: 'PARTIAL',
      strengths: ['Angular'],
      gaps: ['React'],
      talkingPoints: ['Dashboard project'],
      summary: 'Decent fit.',
    };

    it('stores the match on the application', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue(storedApplication);
      userRepository.findUnique.mockResolvedValue({ cvText: 'Angular developer' });
      aiService.matchCv.mockResolvedValue(cvMatch);
      jobApplicationRepository.update.mockResolvedValue({
        ...storedApplication,
        cvMatch,
        cvMatchedAt: new Date(),
      });

      const updatedApplication = await service.matchWithCv(ownerUserId, existingApplicationId);

      expect(aiService.matchCv).toHaveBeenCalledWith({
        cvText: 'Angular developer',
        positionTitle: storedApplication.positionTitle,
        companyName: storedApplication.companyName,
        jobDescription: storedApplication.jobDescription,
      });
      expect(updatedApplication.cvMatch).toEqual(cvMatch);
    });

    it('asks for a job description before calling the model', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue({
        ...storedApplication,
        jobDescription: null,
      });
      userRepository.findUnique.mockResolvedValue({ cvText: 'Angular developer' });

      await expect(service.matchWithCv(ownerUserId, existingApplicationId)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      expect(aiService.matchCv).not.toHaveBeenCalled();
    });

    it('asks for a CV before calling the model', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue(storedApplication);
      userRepository.findUnique.mockResolvedValue({ cvText: null });

      await expect(service.matchWithCv(ownerUserId, existingApplicationId)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      expect(aiService.matchCv).not.toHaveBeenCalled();
    });

    it('clears a stored match when the job description changes', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue({ ...storedApplication, cvMatch });
      jobApplicationRepository.update.mockResolvedValue(storedApplication);

      await service.update(ownerUserId, existingApplicationId, { jobDescription: 'New text' });

      expect(jobApplicationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { jobDescription: 'New text', cvMatch: Prisma.DbNull, cvMatchedAt: null },
        }),
      );
    });

    it('keeps the stored match when other fields change', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue({ ...storedApplication, cvMatch });
      jobApplicationRepository.update.mockResolvedValue(storedApplication);

      await service.update(ownerUserId, existingApplicationId, {
        status: ApplicationStatus.INTERVIEW,
      });

      expect(jobApplicationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: ApplicationStatus.INTERVIEW,
            statusChanges: {
              create: expect.objectContaining({
                fromStatus: ApplicationStatus.APPLIED,
                toStatus: ApplicationStatus.INTERVIEW,
              }) as unknown,
            },
          },
        }),
      );
    });

    it('drops a stored match that no longer fits the schema', async () => {
      jobApplicationRepository.findFirst.mockResolvedValue({
        ...storedApplication,
        cvMatch: { score: 'old format' },
      });

      const application = await service.findOne(ownerUserId, existingApplicationId);

      expect(application.cvMatch).toBeNull();
    });
  });
});
