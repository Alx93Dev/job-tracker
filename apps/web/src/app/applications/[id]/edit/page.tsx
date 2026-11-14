'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { JobApplicationForm } from '@/features/job-applications/components/job-application-form';
import {
  useJobApplication,
  useUpdateJobApplication,
} from '@/features/job-applications/hooks/use-job-applications';
import { toFormValues } from '@/features/job-applications/schemas/job-application-form-schema';

export default function EditJobApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const jobApplicationQuery = useJobApplication(id);
  const updateMutation = useUpdateJobApplication(id);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit application</h1>
      {jobApplicationQuery.isPending && <p aria-live="polite">Loading…</p>}
      {jobApplicationQuery.isError && (
        <p role="alert" className="text-sm text-rose-600">
          Could not load the application: {jobApplicationQuery.error.message}
        </p>
      )}
      {jobApplicationQuery.isSuccess && (
        <JobApplicationForm
          initialValues={toFormValues(jobApplicationQuery.data)}
          submitLabel="Save changes"
          isSubmitting={updateMutation.isPending}
          submitErrorMessage={updateMutation.error?.message}
          onSubmit={(payload) =>
            updateMutation.mutate(payload, { onSuccess: () => router.push('/') })
          }
        />
      )}
    </section>
  );
}
