import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  /** Cabeçalho da coluna */
  header: ReactNode;
  /** Função que extrai/renderiza a célula */
  cell: (item: T, index: number) => ReactNode;
  /** Largura opcional (CSS class do tailwind, ex: 'w-32') */
  width?: string;
  /** Alinhamento */
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Função que retorna a key única de cada item */
  rowKey: (item: T, index: number) => string | number;
  /** Estado vazio (aceita 'empty' ou 'emptyState' — alias) */
  empty?: ReactNode;
  emptyState?: ReactNode;
  /** Estado de carregamento */
  loading?: boolean;
  /** Callback quando linha é clicada */
  onRowClick?: (item: T) => void;
}

const alignClass: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function Table<T>({
  data,
  columns,
  rowKey,
  empty,
  emptyState,
  loading,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-md border border-border bg-bg-elevated/40 p-12 text-center text-sm text-fg-muted">
        Carregando…
      </div>
    );
  }

  const emptyNode = empty ?? emptyState;
  if (data.length === 0 && emptyNode) {
    return <>{emptyNode}</>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-border bg-bg-subtle">
          <tr>
            {columns.map((col, ci) => (
              <th
                key={ci}
                className={cn(
                  'section-number px-4 py-3 font-medium',
                  alignClass[col.align ?? 'left'],
                  col.width,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, ri) => (
            <tr
              key={rowKey(item, ri)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                'border-b border-border/60 transition-colors last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-bg-hover',
                ri % 2 === 1 && 'bg-bg-elevated/40',
              )}
            >
              {columns.map((col, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-4 py-3 text-fg-primary',
                    alignClass[col.align ?? 'left'],
                  )}
                >
                  {col.cell(item, ri)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
