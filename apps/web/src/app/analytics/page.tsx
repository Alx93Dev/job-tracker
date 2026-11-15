'use client';

import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard';
import { useAnalyticsSummary } from '@/features/analytics/hooks/use-analytics-summary';

export default function AnalyticsPage() {
  const summaryQuery = useAnalyticsSummary();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          How your job search is going, based on every status change you make.
        </p>
      </div>
      {summaryQuery.isPending && <p aria-live="polite">Loading metrics…</p>}
      {summaryQuery.isError && (
        <p role="alert" className="text-sm text-rose-600">
          Could not load your metrics: {summaryQuery.error.message}
        </p>
      )}
      {summaryQuery.isSuccess && <AnalyticsDashboard summary={summaryQuery.data} />}
    </section>
  );
}
