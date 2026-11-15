import { describe, expect, it } from 'vitest';
import type { ExtractedJobPosting } from '../types/extracted-job-posting';
import { toFormValuesFromPosting } from './to-form-values-from-posting';

const extractedPosting: ExtractedJobPosting = {
  companyName: 'Acme',
  positionTitle: 'Frontend Developer',
  location: 'Madrid',
  workMode: 'HYBRID',
  salaryRange: '35k - 42k',
  seniority: 'Mid',
  requiredSkills: ['React', 'TypeScript'],
  niceToHaveSkills: ['Angular'],
  summary: 'Build the customer dashboard.',
};

describe('toFormValuesFromPosting', () => {
  it('fills the form and keeps the original posting as the job description', () => {
    const formValues = toFormValuesFromPosting(extractedPosting, '  Full posting text  ');

    expect(formValues).toMatchObject({
      companyName: 'Acme',
      positionTitle: 'Frontend Developer',
      location: 'Madrid (Hybrid)',
      salaryRange: '35k - 42k',
      status: 'WISHLIST',
      jobDescription: 'Full posting text',
    });
    expect(formValues.notes).toBe(
      [
        'Build the customer dashboard.',
        'Seniority: Mid',
        'Required: React, TypeScript',
        'Nice to have: Angular',
      ].join('\n'),
    );
  });

  it('uses the work mode as location when no city is given', () => {
    const formValues = toFormValuesFromPosting(
      { ...extractedPosting, location: null, workMode: 'REMOTE' },
      'text',
    );

    expect(formValues.location).toBe('Remote');
  });

  it('does not repeat the work mode already written in the location', () => {
    const formValues = toFormValuesFromPosting(
      { ...extractedPosting, location: 'Remote (EU)', workMode: 'REMOTE' },
      'text',
    );

    expect(formValues.location).toBe('Remote (EU)');
  });

  it('leaves empty strings for fields the posting does not state', () => {
    const formValues = toFormValuesFromPosting(
      {
        ...extractedPosting,
        location: null,
        workMode: 'UNSPECIFIED',
        salaryRange: null,
        seniority: null,
        requiredSkills: [],
        niceToHaveSkills: [],
      },
      'text',
    );

    expect(formValues.location).toBe('');
    expect(formValues.salaryRange).toBe('');
    expect(formValues.notes).toBe('Build the customer dashboard.');
  });
});
