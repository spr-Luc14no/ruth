import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-ink-50 hover:bg-ink-700 active:bg-ink-950 disabled:bg-ink-300 disabled:cursor-not-allowed',
  secondary:
    'bg-ink-50 text-ink-900 border border-ink-300 hover:bg-ink-100 active:bg-ink-200 disabled:bg-ink-100 disabled:text-ink-400 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-400 disabled:cursor-not-allowed',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span
            className="h-3 w-3 animate-spin rounded-full border border-current border-r-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
