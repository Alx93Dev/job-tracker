'use client';

import { useId, type HTMLInputAutoCompleteAttribute } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { INPUT_CLASS_NAME } from './form-styles';

interface FormFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  type?: 'text' | 'url' | 'date' | 'email' | 'password';
  autoComplete?: HTMLInputAutoCompleteAttribute;
  required?: boolean;
}

export function FormField({
  label,
  registration,
  error,
  type = 'text',
  autoComplete,
  required = false,
}: FormFieldProps) {
  const errorId = useId();

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <input
        {...registration}
        type={type}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={INPUT_CLASS_NAME}
      />
      {error && (
        <span id={errorId} className="text-xs font-normal text-rose-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
