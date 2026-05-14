import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  // ESC para fechar
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Trava o scroll do body quando aberto
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full mx-4 rounded-sm border border-ink-200 bg-ink-50 shadow-2xl animate-slide-up',
          sizeClasses[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-ink-200 px-6 py-4">
          <div>
            <h2 id="modal-title" className="display text-2xl tracking-tightest text-ink-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
