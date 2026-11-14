'use client';

import { SECONDARY_BUTTON_CLASS_NAME } from '@/components/form/form-styles';
import { useDemoLogin } from '../hooks/use-auth';

export function DemoLoginButton() {
  const demoLoginMutation = useDemoLogin();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => demoLoginMutation.mutate()}
        disabled={demoLoginMutation.isPending}
        className={SECONDARY_BUTTON_CLASS_NAME}
      >
        {demoLoginMutation.isPending ? 'Opening demo…' : 'Try the demo — no sign-up'}
      </button>
      {demoLoginMutation.isError && (
        <p role="alert" className="text-sm text-rose-600">
          {demoLoginMutation.error.message}
        </p>
      )}
    </div>
  );
}
