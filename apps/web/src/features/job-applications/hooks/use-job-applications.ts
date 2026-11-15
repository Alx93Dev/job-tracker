import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApplicationsApi } from '../api/job-applications-api';
import type { JobApplication } from '../types/job-application';
import type { JobApplicationFilters } from '../types/job-application-filters';
import type { JobApplicationPayload } from '../types/job-application-payload';
import { applyStatusChange, type StatusChange } from '../utils/apply-status-change';

export const jobApplicationKeys = {
  all: ['job-applications'] as const,
  lists: () => [...jobApplicationKeys.all, 'list'] as const,
  list: (filters: JobApplicationFilters) => [...jobApplicationKeys.lists(), filters] as const,
  detail: (id: string) => [...jobApplicationKeys.all, 'detail', id] as const,
};

type ListQueryKey = ReturnType<typeof jobApplicationKeys.list>;

export function useJobApplications(filters: JobApplicationFilters) {
  return useQuery({
    queryKey: jobApplicationKeys.list(filters),
    queryFn: () => jobApplicationsApi.list(filters),
    placeholderData: (previousData) => previousData,
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

export function useChangeJobApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: StatusChange) => jobApplicationsApi.update(id, { status }),

    onMutate: async (statusChange) => {
      await queryClient.cancelQueries({ queryKey: jobApplicationKeys.lists() });

      const previousLists = queryClient.getQueriesData<JobApplication[]>({
        queryKey: jobApplicationKeys.lists(),
      });
      const changedAt = new Date().toISOString();

      for (const [queryKey, cachedApplications] of previousLists) {
        if (!cachedApplications) continue;
        const [, , filters] = queryKey as ListQueryKey;
        queryClient.setQueryData(
          queryKey,
          applyStatusChange(cachedApplications, statusChange, filters, changedAt),
        );
      }

      return { previousLists };
    },

    onError: (_error, _statusChange, mutationContext) => {
      for (const [queryKey, cachedApplications] of mutationContext?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, cachedApplications);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all }),
  });
}

export function useCvMatch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => jobApplicationsApi.matchWithCv(id),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(jobApplicationKeys.detail(id), updatedApplication);
      return queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() });
    },
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobApplicationsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all }),
  });
}
