import { apiRequest } from '@/lib/api-client';
import type { LoginFormValues } from '../schemas/login-schema';
import type { RegisterPayload } from '../schemas/register-schema';
import type { CurrentUser } from '../types/current-user';

export const authApi = {
  me(): Promise<CurrentUser> {
    return apiRequest('/auth/me');
  },

  login(credentials: LoginFormValues): Promise<CurrentUser> {
    return apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },

  register(payload: RegisterPayload): Promise<CurrentUser> {
    return apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },

  loginAsDemoUser(): Promise<CurrentUser> {
    return apiRequest('/auth/demo', { method: 'POST' });
  },

  logout(): Promise<void> {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};
