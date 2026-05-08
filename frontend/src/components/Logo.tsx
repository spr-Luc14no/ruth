import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <div className={cn('inline-flex items-baseline gap-1', className)}>
      <span className={cn('display italic text-ink-900', sizeClasses[size])}>RUT</span>
      <span className={cn('display italic text-stamp-600', sizeClasses[size])}>h</span>
    </div>
  );
}
