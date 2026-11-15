'use client';

import { CvForm } from '@/features/profile/components/cv-form';
import { useCvProfile } from '@/features/profile/hooks/use-cv';

export default function ProfilePage() {
  const cvProfileQuery = useCvProfile();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">My CV</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your CV is compared with job descriptions to show what fits and what to highlight. It is
          only used for that comparison and is never shared.
        </p>
      </div>
      {cvProfileQuery.isPending && <p aria-live="polite">Loading…</p>}
      {cvProfileQuery.isError && (
        <p role="alert" className="text-sm text-rose-600">
          Could not load your CV: {cvProfileQuery.error.message}
        </p>
      )}
      {cvProfileQuery.isSuccess && <CvForm cvProfile={cvProfileQuery.data} />}
    </section>
  );
}
