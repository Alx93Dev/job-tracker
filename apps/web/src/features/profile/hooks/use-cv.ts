import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile-api';

export const cvProfileKey = ['profile', 'cv'] as const;

export function useCvProfile() {
  return useQuery({ queryKey: cvProfileKey, queryFn: profileApi.getCv });
}

export function useUpdateCv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateCv,
    onSuccess: (cvProfile) => queryClient.setQueryData(cvProfileKey, cvProfile),
  });
}
