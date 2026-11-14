'use client';

import { useRouter } from 'next/navigation';
import { JobApplicationForm } from '@/features/job-applications/components/job-application-form';
import { useCreateJobApplication } from '@/features/job-applications/hooks/use-job-applications';

export default function NewJobApplicationPage() {
  const router = useRouter();
  const createMutation = useCreateJobApplication();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New application</h1>
      <JobApplicationForm
        submitLabel="Create application"
        isSubmitting={createMutation.isPending}
        submitErrorMessage={createMutation.error?.message}
        onSubmit={(payload) =>
          createMutation.mutate(payload, { onSuccess: () => router.push('/') })
        }
      />
    </section>
  );
}
