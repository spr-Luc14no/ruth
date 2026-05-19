import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border bg-bg-elevated/40 px-6 py-16 text-center">
      {Icon && (
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated">
          <Icon size={20} className="text-fg-muted" />
        </div>
      )}
      <h3 className="display text-2xl text-fg-primary">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-5 inline-flex">{action}</div>}
    </div>
  );
}
