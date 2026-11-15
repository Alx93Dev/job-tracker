import Link from 'next/link';
import { Suspense } from 'react';
import { JobApplicationsDashboard } from '@/features/job-applications/components/job-applications-dashboard';

/**
 * The heading is rendered on the server; only the dashboard, which reads the view mode from
 * the URL, waits for the browser. That keeps the largest paint in the initial HTML.
 */
export default function JobApplicationsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Link
          href="/applications/new"
          prefetch={false}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New application
        </Link>
      </div>
      <Suspense fallback={<p aria-live="polite">Loading applications…</p>}>
        <JobApplicationsDashboard />
      </Suspense>
    </section>
  );
}
