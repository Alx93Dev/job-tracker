import { ApplicationStatus } from '@prisma/client';
import {
  DAYS_DECIMALS,
  DAYS_PER_WEEK,
  MILLISECONDS_PER_DAY,
  WEEKLY_ACTIVITY_WEEKS,
} from './analytics.constants';
import type { AnalyticsSummaryResponseDto } from './dto/analytics-summary-response.dto';
import type { WeeklyActivityDto } from './dto/weekly-activity.dto';

export interface AnalyticsStatusChange {
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: Date;
}

export interface AnalyticsApplication {
  status: ApplicationStatus;
  appliedAt: Date | null;
  followUpAt: Date | null;
  statusChanges: AnalyticsStatusChange[];
}

const RESPONSE_STATUSES: readonly ApplicationStatus[] = [
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];
const INTERVIEW_OR_LATER: readonly ApplicationStatus[] = [
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
];
const FOLLOW_UP_STATUSES: readonly ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.INTERVIEW,
];

interface ApplicationJourney {
  appliedDate: Date | null;
  hasResponse: boolean;
  reachedInterview: boolean;
  reachedOffer: boolean;
  daysToFirstResponse: number | null;
}

function hasReached(application: AnalyticsApplication, statuses: readonly ApplicationStatus[]) {
  return (
    statuses.includes(application.status) ||
    application.statusChanges.some((change) => statuses.includes(change.toStatus))
  );
}

/**
 * Reads one application's history. The first entry of a history has no `fromStatus`
 * (the application was created in that status, or backfilled by the migration), so it is
 * not counted as a real "response" when measuring how long companies take to answer.
 */
function describeJourney(application: AnalyticsApplication): ApplicationJourney {
  const history = [...application.statusChanges].sort(
    (first, second) => first.changedAt.getTime() - second.changedAt.getTime(),
  );
  const wasSent =
    application.status !== ApplicationStatus.WISHLIST ||
    history.some((change) => change.toStatus !== ApplicationStatus.WISHLIST);

  const appliedDate = wasSent
    ? (application.appliedAt ??
      history.find((change) => change.toStatus === ApplicationStatus.APPLIED)?.changedAt ??
      history.find((change) => change.toStatus !== ApplicationStatus.WISHLIST)?.changedAt ??
      null)
    : null;

  const firstTrackedResponse = history.find(
    (change) =>
      change.fromStatus !== null &&
      RESPONSE_STATUSES.includes(change.toStatus) &&
      (!appliedDate || change.changedAt >= appliedDate),
  );

  const daysToFirstResponse =
    firstTrackedResponse && appliedDate
      ? (firstTrackedResponse.changedAt.getTime() - appliedDate.getTime()) / MILLISECONDS_PER_DAY
      : null;

  return {
    appliedDate,
    hasResponse: wasSent && hasReached(application, RESPONSE_STATUSES),
    reachedInterview: hasReached(application, INTERVIEW_OR_LATER),
    reachedOffer: hasReached(application, [ApplicationStatus.OFFER]),
    daysToFirstResponse,
  };
}

function toRate(part: number, total: number): number | null {
  return total === 0 ? null : part / total;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(mean.toFixed(DAYS_DECIMALS));
}

function startOfUtcWeek(date: Date): Date {
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (dayStart.getUTCDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  return new Date(dayStart.getTime() - daysSinceMonday * MILLISECONDS_PER_DAY);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildWeeklyActivity(appliedDates: Date[], now: Date): WeeklyActivityDto[] {
  const currentWeekStart = startOfUtcWeek(now);
  const weekStarts = Array.from({ length: WEEKLY_ACTIVITY_WEEKS }, (_, weekIndex) => {
    const weeksAgo = WEEKLY_ACTIVITY_WEEKS - 1 - weekIndex;
    return new Date(currentWeekStart.getTime() - weeksAgo * DAYS_PER_WEEK * MILLISECONDS_PER_DAY);
  });

  const countsByWeek = new Map(weekStarts.map((weekStart) => [toIsoDate(weekStart), 0]));
  for (const appliedDate of appliedDates) {
    const weekKey = toIsoDate(startOfUtcWeek(appliedDate));
    const currentCount = countsByWeek.get(weekKey);
    if (currentCount !== undefined) {
      countsByWeek.set(weekKey, currentCount + 1);
    }
  }

  return [...countsByWeek].map(([weekStart, count]) => ({ weekStart, count }));
}

export function computeAnalyticsSummary(
  applications: AnalyticsApplication[],
  now: Date,
): AnalyticsSummaryResponseDto {
  const countsByStatus = Object.fromEntries(
    Object.values(ApplicationStatus).map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const application of applications) {
    countsByStatus[application.status] += 1;
  }

  const journeys = applications.map(describeJourney);
  const sentJourneys = journeys.filter((journey) => journey.appliedDate !== null);
  const appliedCount = sentJourneys.length;
  const respondedCount = sentJourneys.filter((journey) => journey.hasResponse).length;
  const interviewCount = sentJourneys.filter((journey) => journey.reachedInterview).length;
  const offerCount = sentJourneys.filter((journey) => journey.reachedOffer).length;

  const openFollowUps = applications.filter(
    (application) => application.followUpAt && FOLLOW_UP_STATUSES.includes(application.status),
  );
  const overdueFollowUps = openFollowUps.filter(
    (application) => application.followUpAt && application.followUpAt <= now,
  ).length;

  return {
    totalApplications: applications.length,
    countsByStatus,
    appliedCount,
    respondedCount,
    responseRate: toRate(respondedCount, appliedCount),
    interviewRate: toRate(interviewCount, appliedCount),
    offerRate: toRate(offerCount, appliedCount),
    averageDaysToFirstResponse: average(
      sentJourneys
        .map((journey) => journey.daysToFirstResponse)
        .filter((days): days is number => days !== null),
    ),
    funnel: [
      { stage: ApplicationStatus.APPLIED, count: appliedCount },
      { stage: ApplicationStatus.INTERVIEW, count: interviewCount },
      { stage: ApplicationStatus.OFFER, count: offerCount },
    ],
    weeklyApplications: buildWeeklyActivity(
      sentJourneys
        .map((journey) => journey.appliedDate)
        .filter((date): date is Date => date !== null),
      now,
    ),
    followUps: { overdue: overdueFollowUps, upcoming: openFollowUps.length - overdueFollowUps },
  };
}
