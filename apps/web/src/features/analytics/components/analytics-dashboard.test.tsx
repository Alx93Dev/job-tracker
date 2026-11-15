import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AnalyticsSummary } from '../types/analytics-summary';
import { formatDays, formatRate, formatShare } from '../utils/format-metrics';
import { AnalyticsDashboard } from './analytics-dashboard';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const weeks = Array.from({ length: 12 }, (_, weekIndex) => ({
  weekStart: new Date(Date.UTC(2026, 7, 31 + weekIndex * 7)).toISOString().slice(0, 10),
  count: weekIndex === 11 ? 3 : weekIndex % 3,
}));

const summary: AnalyticsSummary = {
  totalApplications: 12,
  countsByStatus: { WISHLIST: 2, APPLIED: 3, INTERVIEW: 2, OFFER: 1, REJECTED: 4 },
  appliedCount: 10,
  respondedCount: 7,
  responseRate: 0.7,
  interviewRate: 0.4,
  offerRate: 0.1,
  averageDaysToFirstResponse: 6.5,
  funnel: [
    { stage: 'APPLIED', count: 10 },
    { stage: 'INTERVIEW', count: 4 },
    { stage: 'OFFER', count: 1 },
  ],
  weeklyApplications: weeks,
  followUps: { overdue: 2, upcoming: 1 },
};

// Expected values go through the same formatters because numbers follow the viewer's locale.
describe('AnalyticsDashboard', () => {
  it('shows the headline metrics as labelled values', () => {
    render(<AnalyticsDashboard summary={summary} />);

    const responseRateTile = screen.getByText('Response rate').closest('div') as HTMLElement;
    expect(within(responseRateTile).getByText(formatRate(0.7))).toBeInTheDocument();
    expect(within(responseRateTile).getByText('7 of 10 got an answer')).toBeInTheDocument();
    expect(screen.getByText(formatDays(6.5))).toBeInTheDocument();
    expect(screen.getByText(/follow-ups are due/)).toBeInTheDocument();
  });

  it('labels every funnel stage with its count and share of applications sent', () => {
    render(<AnalyticsDashboard summary={summary} />);

    const funnel = screen.getByRole('list', { name: 'Application funnel' });
    const interviewStage = within(funnel).getByText('Interview').closest('li') as HTMLElement;
    expect(within(interviewStage).getByText('4')).toBeInTheDocument();
    expect(within(interviewStage).getByText(formatShare(4, 10))).toBeInTheDocument();
  });

  it('offers the weekly chart as a table', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard summary={summary} />);

    await user.click(screen.getByRole('button', { name: 'Show as table' }));

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(13);
    expect(screen.getByRole('button', { name: 'Show chart' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('invites the user to add applications when there is no data', () => {
    render(<AnalyticsDashboard summary={{ ...summary, totalApplications: 0 }} />);

    expect(screen.getByRole('link', { name: 'Add your first application' })).toHaveAttribute(
      'href',
      '/applications/new',
    );
  });
});
