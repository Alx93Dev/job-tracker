import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildJobApplication } from '@/features/job-applications/test-utils/build-job-application';
import type { JobApplication } from '@/features/job-applications/types/job-application';
import { CvMatchPanel } from './cv-match-panel';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderPanel(jobApplication: JobApplication) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CvMatchPanel jobApplication={jobApplication} />
    </QueryClientProvider>,
  );
}

describe('CvMatchPanel', () => {
  it('asks for a job description before allowing a comparison', () => {
    renderPanel(buildJobApplication({ jobDescription: null }));

    expect(screen.getByRole('button', { name: 'Compare with my CV' })).toBeDisabled();
    expect(screen.getByText(/add the job description above/i)).toBeInTheDocument();
  });

  it('shows a stored match with its score, verdict and lists', () => {
    renderPanel(
      buildJobApplication({
        jobDescription: 'We need React',
        cvMatch: {
          matchScore: 82,
          verdict: 'STRONG',
          strengths: ['Angular dashboards'],
          gaps: ['No React in production'],
          talkingPoints: ['Lead with the finance dashboard'],
          summary: 'Good fit overall.',
        },
        cvMatchedAt: '2026-11-15T10:00:00.000Z',
      }),
    );

    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('Strong match')).toBeInTheDocument();
    expect(screen.getByText('Good fit overall.')).toBeInTheDocument();
    const gapsList = screen.getByRole('heading', { name: 'Gaps' }).nextElementSibling;
    expect(within(gapsList as HTMLElement).getByText('No React in production')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Compare again' })).toBeEnabled();
  });
});
