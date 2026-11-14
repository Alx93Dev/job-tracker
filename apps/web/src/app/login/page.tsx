import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { LoginForm } from '@/features/auth/components/login-form';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Sign in · Job Tracker' };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard
        title="Welcome back"
        description="Sign in to keep tracking your job search."
        alternativeAction={{
          prompt: 'New here?',
          linkLabel: 'Create an account',
          href: ROUTES.register,
        }}
      >
        <LoginForm />
      </AuthCard>
    </Suspense>
  );
}
