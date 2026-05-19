import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  marker?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, marker, options, placeholder, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor={selectId} className="text-sm font-medium text-ink-800">
              {label}
            </label>
            {marker && <span className="section-number">{marker}</span>}
          </div>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError || undefined}
            className={cn(
              'w-full appearance-none rounded-sm border bg-ink-50 px-3 py-2.5 pr-9 font-sans text-sm text-ink-900',
              'transition-colors duration-150',
              hasError
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-ink-300 focus:border-ink-900',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
        </div>

        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
