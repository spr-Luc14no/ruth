import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-sm border border-dashed border-ink-300 bg-ink-50 px-6 py-16 text-center">
      {Icon && (
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-100">
          <Icon size={18} className="text-ink-500" />
        </div>
      )}
      <p className="display text-2xl text-ink-900">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
