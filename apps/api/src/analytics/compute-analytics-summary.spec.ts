import { ApplicationStatus } from '@prisma/client';
import {
  computeAnalyticsSummary,
  type AnalyticsApplication,
  type AnalyticsStatusChange,
} from './compute-analytics-summary';

const { WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED } = ApplicationStatus;
const now = new Date('2026-11-18T12:00:00.000Z');

function change(
  fromStatus: ApplicationStatus | null,
  toStatus: ApplicationStatus,
  isoDate: string,
): AnalyticsStatusChange {
  return { fromStatus, toStatus, changedAt: new Date(isoDate) };
}

function application(overrides: Partial<AnalyticsApplication>): AnalyticsApplication {
  return { status: WISHLIST, appliedAt: null, followUpAt: null, statusChanges: [], ...overrides };
}

const applications: AnalyticsApplication[] = [
  application({ statusChanges: [change(null, WISHLIST, '2026-11-01')] }),
  application({
    status: INTERVIEW,
    appliedAt: new Date('2026-11-02'),
    followUpAt: new Date('2026-11-25'),
    statusChanges: [
      change(null, WISHLIST, '2026-11-01'),
      change(WISHLIST, APPLIED, '2026-11-02'),
      change(APPLIED, INTERVIEW, '2026-11-06'),
    ],
  }),
  application({
    status: OFFER,
    appliedAt: new Date('2026-11-03'),
    statusChanges: [
      change(null, APPLIED, '2026-11-03'),
      change(APPLIED, INTERVIEW, '2026-11-05'),
      change(INTERVIEW, OFFER, '2026-11-12'),
    ],
  }),
  application({
    status: REJECTED,
    appliedAt: new Date('2026-11-10'),
    statusChanges: [change(null, APPLIED, '2026-11-10'), change(APPLIED, REJECTED, '2026-11-16')],
  }),
  application({
    status: APPLIED,
    appliedAt: new Date('2026-11-16'),
    followUpAt: new Date('2026-11-17'),
    statusChanges: [change(null, APPLIED, '2026-11-16')],
  }),
];

describe('computeAnalyticsSummary', () => {
  const summary = computeAnalyticsSummary(applications, now);

  it('counts applications by current status', () => {
    expect(summary.totalApplications).toBe(5);
    expect(summary.countsByStatus).toEqual({
      WISHLIST: 1,
      APPLIED: 1,
      INTERVIEW: 1,
      OFFER: 1,
      REJECTED: 1,
    });
  });

  it('computes response, interview and offer rates over sent applications only', () => {
    expect(summary.appliedCount).toBe(4);
    expect(summary.respondedCount).toBe(3);
    expect(summary.responseRate).toBe(0.75);
    expect(summary.interviewRate).toBe(0.5);
    expect(summary.offerRate).toBe(0.25);
  });

  it('averages the days from applying to the first answer', () => {
    // 4 days (interview), 2 days (interview before offer) and 6 days (rejection)
    expect(summary.averageDaysToFirstResponse).toBe(4);
  });

  it('builds the funnel from the furthest stage each application reached', () => {
    expect(summary.funnel).toEqual([
      { stage: APPLIED, count: 4 },
      { stage: INTERVIEW, count: 2 },
      { stage: OFFER, count: 1 },
    ]);
  });

  it('groups applications into the last 12 Monday-based weeks', () => {
    expect(summary.weeklyApplications).toHaveLength(12);
    expect(summary.weeklyApplications.at(-1)).toEqual({ weekStart: '2026-11-16', count: 1 });
    expect(summary.weeklyApplications.at(-2)).toEqual({ weekStart: '2026-11-09', count: 1 });
    expect(summary.weeklyApplications.at(-3)).toEqual({ weekStart: '2026-11-02', count: 2 });
  });

  it('splits open follow-ups into overdue and upcoming', () => {
    expect(summary.followUps).toEqual({ overdue: 1, upcoming: 1 });
  });

  it('does not count a status an application was created in as a response', () => {
    const backfilledRejection = application({
      status: REJECTED,
      appliedAt: new Date('2026-11-01'),
      statusChanges: [change(null, REJECTED, '2026-11-01')],
    });

    const backfilledSummary = computeAnalyticsSummary([backfilledRejection], now);

    expect(backfilledSummary.respondedCount).toBe(1);
    expect(backfilledSummary.averageDaysToFirstResponse).toBeNull();
  });

  it('returns null rates instead of dividing by zero', () => {
    const emptySummary = computeAnalyticsSummary([], now);

    expect(emptySummary.responseRate).toBeNull();
    expect(emptySummary.averageDaysToFirstResponse).toBeNull();
    expect(emptySummary.weeklyApplications.every((week) => week.count === 0)).toBe(true);
  });
});
