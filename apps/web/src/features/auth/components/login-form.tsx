'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/form/form-field';
import { PRIMARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import { useLogin } from '../hooks/use-auth';
import { loginSchema, type LoginFormValues } from '../schemas/login-schema';

export function LoginForm() {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((credentials) => loginMutation.mutate(credentials))}
      className="flex flex-col gap-4"
    >
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email}
        required
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
        required
      />
      {loginMutation.isError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {loginMutation.error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className={PRIMARY_BUTTON_CLASS_NAME}
      >
        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
