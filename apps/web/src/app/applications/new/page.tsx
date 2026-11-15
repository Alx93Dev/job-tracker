'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImportFromPostingPanel } from '@/features/ai/components/import-from-posting-panel';
import { JobApplicationForm } from '@/features/job-applications/components/job-application-form';
import { useCreateJobApplication } from '@/features/job-applications/hooks/use-job-applications';
import {
  emptyJobApplicationFormValues,
  type JobApplicationFormValues,
} from '@/features/job-applications/schemas/job-application-form-schema';

export default function NewJobApplicationPage() {
  const router = useRouter();
  const createMutation = useCreateJobApplication();
  const [importedValues, setImportedValues] = useState({
    formValues: emptyJobApplicationFormValues,
    importCount: 0,
  });

  const handleImported = (formValues: JobApplicationFormValues) =>
    setImportedValues(({ importCount }) => ({ formValues, importCount: importCount + 1 }));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New application</h1>
      <ImportFromPostingPanel onImported={handleImported} />
      {/* A new key remounts the form so it picks up the imported values as its defaults. */}
      <JobApplicationForm
        key={importedValues.importCount}
        initialValues={importedValues.formValues}
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
