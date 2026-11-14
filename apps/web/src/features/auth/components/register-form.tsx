'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/form/form-field';
import { PRIMARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import { useRegister } from '../hooks/use-auth';
import {
  registerSchema,
  toRegisterPayload,
  type RegisterFormValues,
} from '../schemas/register-schema';

export function RegisterForm() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((formValues) =>
        registerMutation.mutate(toRegisterPayload(formValues)),
      )}
      className="flex flex-col gap-4"
    >
      <FormField
        label="Name"
        autoComplete="name"
        registration={register('name')}
        error={errors.name}
      />
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
        autoComplete="new-password"
        registration={register('password')}
        error={errors.password}
        required
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword}
        required
      />
      {registerMutation.isError && (
        <p role="alert" className="text-sm text-rose-600">
          {registerMutation.error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={registerMutation.isPending}
        className={PRIMARY_BUTTON_CLASS_NAME}
      >
        {registerMutation.isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
