import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-fg-primary hover:bg-primary-400 hover:shadow-glow-primary active:bg-primary-600',
  accent:
    'bg-accent-500 text-fg-primary hover:bg-accent-400 hover:shadow-glow-accent active:bg-accent-600',
  secondary:
    'border border-border-strong bg-bg-elevated text-fg-primary hover:border-primary-500 hover:bg-bg-hover',
  ghost:
    'bg-transparent text-fg-secondary hover:bg-bg-elevated hover:text-fg-primary',
  danger:
    'bg-accent-700 text-fg-primary hover:bg-accent-600 hover:shadow-glow-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
