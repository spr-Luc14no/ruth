import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Pequeno rótulo numérico no canto direito do label, ex: "01" */
  marker?: string;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, marker, trailing, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor={inputId} className="text-sm font-medium text-ink-800">
              {label}
            </label>
            {marker && <span className="section-number">{marker}</span>}
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full rounded-sm border bg-ink-50 px-3 py-2.5 font-sans text-sm text-ink-900',
              'placeholder:text-ink-400',
              'transition-colors duration-150',
              hasError
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-ink-300 focus:border-ink-900',
              trailing ? 'pr-10' : null,
              className
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-500">
              {trailing}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
