import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-sm border border-ink-200 bg-ink-50 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
