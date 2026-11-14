import { Suspense } from 'react';
import { JobApplicationsDashboard } from '@/features/job-applications/components/job-applications-dashboard';

export default function JobApplicationsPage() {
  return (
    <Suspense fallback={<p aria-live="polite">Loading applications…</p>}>
      <JobApplicationsDashboard />
    </Suspense>
  );
}
