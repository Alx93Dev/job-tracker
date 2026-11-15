import Link from 'next/link';
import type { ReactNode } from 'react';
import { DemoLoginButton } from './demo-login-button';

interface AuthCardProps {
  title: string;
  description: string;
  alternativeAction: { prompt: string; linkLabel: string; href: string };
  children: ReactNode;
}

export function AuthCard({ title, description, alternativeAction, children }: AuthCardProps) {
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {children}

      <div
        className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        or
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <DemoLoginButton />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {alternativeAction.prompt}{' '}
        <Link
          href={alternativeAction.href}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {alternativeAction.linkLabel}
        </Link>
      </p>
    </section>
  );
}
