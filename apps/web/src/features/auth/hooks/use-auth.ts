import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { NEXT_PATH_QUERY_PARAM, ROUTES, toSafeNextPath } from '@/lib/routes';
import { authApi } from '../api/auth-api';
import type { LoginFormValues } from '../schemas/login-schema';
import type { RegisterPayload } from '../schemas/register-schema';
import type { CurrentUser } from '../types/current-user';

export const currentUserKey = ['auth', 'current-user'] as const;

export function useCurrentUser(isEnabled = true) {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: authApi.me,
    enabled: isEnabled,
    retry: false,
  });
}

/**
 * Every way of signing in ends the same way: drop data cached for any previous user,
 * remember the new one and continue to the page the visitor originally asked for.
 */
function useStartSession() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (currentUser: CurrentUser) => {
    queryClient.clear();
    queryClient.setQueryData(currentUserKey, currentUser);
    router.replace(toSafeNextPath(searchParams.get(NEXT_PATH_QUERY_PARAM)));
    router.refresh();
  };
}

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (credentials: LoginFormValues) => authApi.login(credentials),
    onSuccess: startSession,
  });
}

export function useRegister() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: startSession,
  });
}

export function useDemoLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: authApi.loginAsDemoUser,
    onSuccess: startSession,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace(ROUTES.login);
      router.refresh();
    },
  });
}
