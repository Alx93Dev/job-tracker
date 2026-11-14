import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApplicationsApi } from '../api/job-applications-api';
import type { ApplicationStatus } from '../types/application-status';
import type { JobApplicationPayload } from '../types/job-application-payload';

export const jobApplicationKeys = {
  all: ['job-applications'] as const,
  list: (status?: ApplicationStatus) =>
    [...jobApplicationKeys.all, 'list', status ?? 'ALL'] as const,
  detail: (id: string) => [...jobApplicationKeys.all, 'detail', id] as const,
};

export function useJobApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: jobApplicationKeys.list(status),
    queryFn: () => jobApplicationsApi.list(status),
  });
}

export function useJobApplication(id: string) {
  return useQuery({
    queryKey: jobApplicationKeys.detail(id),
    queryFn: () => jobApplicationsApi.get(id),
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobApplicationPayload) => jobApplicationsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all }),
  });
}

export function useUpdateJobApplication(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobApplicationPayload) => jobApplicationsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all }),
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobApplicationsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all }),
  });
}
