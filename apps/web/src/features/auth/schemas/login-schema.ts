import { z } from 'zod';
import { AUTH_LIMITS } from '../constants/auth-limits';

export const loginSchema = z.object({
  email: z.email('Enter a valid email').max(AUTH_LIMITS.emailMaxLength),
  password: z.string().min(1, 'Password is required').max(AUTH_LIMITS.passwordMaxLength),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
