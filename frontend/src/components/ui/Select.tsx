import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  marker?: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, marker, options, placeholder, className, id, ...rest },
    ref,
  ) => {
    const reactId = useId();
    const selectId = id ?? reactId;

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={selectId}
              className="text-sm font-medium text-fg-secondary"
            >
              {label}
              {rest.required && <span className="ml-0.5 text-accent-500">*</span>}
            </label>
            {marker && <span className="section-number">{marker}</span>}
          </div>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'block w-full appearance-none rounded-md border bg-bg-elevated py-2.5 pl-3 pr-9 text-sm text-fg-primary',
              'transition-colors duration-150',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-500/30'
                : 'border-border',
              className,
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
        </div>
        {error ? (
          <p className="text-xs text-accent-400">{error}</p>
        ) : hint ? (
          <p className="text-xs text-fg-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = 'Select';
