import Link from 'next/link';
import type { ReactNode } from 'react';
import { APPLICATION_STATUS_LABELS } from '@/features/job-applications/constants/application-status-display';
import { APPLICATION_STATUSES } from '@/features/job-applications/types/application-status';
import type { AnalyticsSummary } from '../types/analytics-summary';
import { formatDays, formatRate, formatShare } from '../utils/format-metrics';
import { HorizontalBarList } from './horizontal-bar-list';
import { StatTile } from './stat-tile';
import { WeeklyApplicationsChart } from './weekly-applications-chart';

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function AnalyticsDashboard({ summary }: { summary: AnalyticsSummary }) {
  if (summary.totalApplications === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
        No data yet.{' '}
        <Link href="/applications/new" className="text-blue-600 hover:underline">
          Add your first application
        </Link>{' '}
        to see your search metrics.
      </p>
    );
  }

  const { appliedCount, followUps } = summary;

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Applications sent"
          value={String(appliedCount)}
          detail={`${summary.countsByStatus.WISHLIST} more in wishlist`}
        />
        <StatTile
          label="Response rate"
          value={formatRate(summary.responseRate)}
          detail={`${summary.respondedCount} of ${appliedCount} got an answer`}
        />
        <StatTile
          label="Interview rate"
          value={formatRate(summary.interviewRate)}
          detail={`Offer rate ${formatRate(summary.offerRate)}`}
        />
        <StatTile
          label="Time to first answer"
          value={formatDays(summary.averageDaysToFirstResponse)}
          detail="Average from applying"
        />
      </dl>

      {(followUps.overdue > 0 || followUps.upcoming > 0) && (
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm dark:border-orange-900 dark:bg-orange-950/40">
          <span aria-hidden="true">⏰ </span>
          <strong className="font-semibold">{followUps.overdue}</strong> follow-up
          {followUps.overdue === 1 ? ' is' : 's are'} due and{' '}
          <strong className="font-semibold">{followUps.upcoming}</strong> coming up.
        </p>
      )}

      <Panel title="Applications per week" description="Applications sent over the last 12 weeks">
        <WeeklyApplicationsChart weeks={summary.weeklyApplications} />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Funnel" description="How far your applications got, as a share of those sent">
          <HorizontalBarList
            ariaLabel="Application funnel"
            items={summary.funnel.map((funnelStage) => ({
              key: funnelStage.stage,
              label: APPLICATION_STATUS_LABELS[funnelStage.stage],
              value: funnelStage.count,
              annotation: formatShare(funnelStage.count, appliedCount),
            }))}
          />
        </Panel>

        <Panel title="Current status" description="Where every application stands today">
          <HorizontalBarList
            ariaLabel="Applications by current status"
            items={APPLICATION_STATUSES.map((status) => ({
              key: status,
              label: APPLICATION_STATUS_LABELS[status],
              value: summary.countsByStatus[status],
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
