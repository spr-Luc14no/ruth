import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  marker?: string; // ex: '01' aparece em mono pequeno antes do label
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, marker, className, id, ...rest }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-fg-secondary"
            >
              {label}
              {rest.required && <span className="ml-0.5 text-accent-500">*</span>}
            </label>
            {marker && <span className="section-number">{marker}</span>}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(
            'block w-full rounded-md border bg-bg-elevated px-3 py-2.5 text-sm text-fg-primary',
            'placeholder:text-fg-muted',
            'transition-colors duration-150',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-500/30'
              : 'border-border',
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-accent-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-fg-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
