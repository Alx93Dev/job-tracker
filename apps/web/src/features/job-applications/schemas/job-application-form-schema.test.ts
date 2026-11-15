import { describe, expect, it } from 'vitest';
import type { JobApplication } from '../types/job-application';
import {
  emptyJobApplicationFormValues,
  jobApplicationFormSchema,
  toFormValues,
  toPayload,
} from './job-application-form-schema';

describe('jobApplicationFormSchema', () => {
  it('rejects a blank company and position', () => {
    const validation = jobApplicationFormSchema.safeParse(emptyJobApplicationFormValues);

    expect(validation.success).toBe(false);
    const invalidFields = validation.error?.issues.map((issue) => issue.path[0]);
    expect(invalidFields).toEqual(expect.arrayContaining(['companyName', 'positionTitle']));
  });

  it('rejects a malformed job URL but accepts an empty one', () => {
    const baseValues = {
      ...emptyJobApplicationFormValues,
      companyName: 'Acme',
      positionTitle: 'Dev',
    };

    expect(jobApplicationFormSchema.safeParse({ ...baseValues, jobUrl: 'not a url' }).success).toBe(
      false,
    );
    expect(jobApplicationFormSchema.safeParse(baseValues).success).toBe(true);
  });
});

describe('toPayload', () => {
  it('sends null for optional fields left empty so editing can clear them', () => {
    const payload = toPayload({
      ...emptyJobApplicationFormValues,
      companyName: 'Acme',
      positionTitle: 'Frontend Developer',
    });

    expect(payload).toEqual({
      companyName: 'Acme',
      positionTitle: 'Frontend Developer',
      status: 'WISHLIST',
      jobUrl: null,
      location: null,
      salaryRange: null,
      appliedAt: null,
      notes: null,
      jobDescription: null,
    });
  });
});

describe('toFormValues', () => {
  it('maps nulls to empty strings and trims the ISO date', () => {
    const jobApplication: JobApplication = {
      id: 'application-id',
      companyName: 'Acme',
      positionTitle: 'Frontend Developer',
      jobUrl: null,
      location: null,
      salaryRange: null,
      status: 'APPLIED',
      appliedAt: '2026-11-03T00:00:00.000Z',
      notes: null,
      jobDescription: null,
      cvMatch: null,
      cvMatchedAt: null,
      createdAt: '2026-11-03T00:00:00.000Z',
      updatedAt: '2026-11-03T00:00:00.000Z',
    };

    expect(toFormValues(jobApplication)).toMatchObject({
      jobUrl: '',
      location: '',
      appliedAt: '2026-11-03',
      status: 'APPLIED',
    });
  });
});
