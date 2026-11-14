import { z } from 'zod';
import { AUTH_LIMITS } from '../constants/auth-limits';

export const registerSchema = z
  .object({
    name: z.string().trim().max(AUTH_LIMITS.nameMaxLength),
    email: z.email('Enter a valid email').max(AUTH_LIMITS.emailMaxLength),
    password: z
      .string()
      .min(
        AUTH_LIMITS.passwordMinLength,
        `Use at least ${AUTH_LIMITS.passwordMinLength} characters`,
      )
      .max(AUTH_LIMITS.passwordMaxLength),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export function toRegisterPayload(formValues: RegisterFormValues): RegisterPayload {
  return {
    email: formValues.email,
    password: formValues.password,
    name: formValues.name || undefined,
  };
}
