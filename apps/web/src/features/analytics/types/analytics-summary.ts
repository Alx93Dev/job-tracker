import type { ApplicationStatus } from '@/features/job-applications/types/application-status';

export interface FunnelStage {
  stage: ApplicationStatus;
  count: number;
}

export interface WeeklyActivity {
  weekStart: string;
  count: number;
}

export interface AnalyticsSummary {
  totalApplications: number;
  countsByStatus: Record<ApplicationStatus, number>;
  appliedCount: number;
  respondedCount: number;
  responseRate: number | null;
  interviewRate: number | null;
  offerRate: number | null;
  averageDaysToFirstResponse: number | null;
  funnel: FunnelStage[];
  weeklyApplications: WeeklyActivity[];
  followUps: { overdue: number; upcoming: number };
}
