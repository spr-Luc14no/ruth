import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'stamp';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500/15 text-primary-300 border border-primary-500/30',
  accent: 'bg-accent-500/15 text-accent-400 border border-accent-500/30',
  success: 'bg-success-500/15 text-success-400 border border-success-500/30',
  warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/30',
  danger: 'bg-accent-500/20 text-accent-400 border border-accent-500/40',
  neutral: 'bg-bg-hover text-fg-secondary border border-border',
  stamp: 'bg-primary-500/15 text-primary-300 border border-primary-500/30',
};

export function Badge({ variant = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
