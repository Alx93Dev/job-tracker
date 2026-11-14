import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { RegisterForm } from '@/features/auth/components/register-form';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Create account · Job Tracker' };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthCard
        title="Create your account"
        description="Organize every application from wishlist to offer."
        alternativeAction={{
          prompt: 'Already have an account?',
          linkLabel: 'Sign in',
          href: ROUTES.login,
        }}
      >
        <RegisterForm />
      </AuthCard>
    </Suspense>
  );
}
