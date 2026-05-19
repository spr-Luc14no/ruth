import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'stamp';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  neutral: 'bg-ink-100 text-ink-700 border-ink-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  stamp: 'bg-stamp-50 text-stamp-700 border-stamp-100',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
