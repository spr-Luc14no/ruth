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
  /** Estado vazio */
  empty?: ReactNode;
  /** Estado de carregamento */
  loading?: boolean;
  /** Action ao clicar na linha */
  onRowClick?: (item: T) => void;
  /** Mostrar coluna de numeração à esquerda (01, 02, ...) */
  numbered?: boolean;
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function Table<T>({
  data,
  columns,
  rowKey,
  empty,
  loading,
  onRowClick,
  numbered = true,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-sm border border-ink-200 bg-ink-50 p-12 text-center text-sm text-ink-500">
        Carregando…
      </div>
    );
  }

  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-ink-200 bg-ink-50">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-ink-200">
            {numbered && (
              <th className="w-12 px-4 py-3 text-left">
                <span className="section-number">nº</span>
              </th>
            )}
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500',
                  alignClasses[col.align ?? 'left'],
                  col.width,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={rowKey(item, index)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                'border-b border-ink-100 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-ink-100/60',
              )}
            >
              {numbered && (
                <td className="w-12 px-4 py-3.5 font-mono text-xs tabular-nums text-ink-400">
                  {String(index + 1).padStart(2, '0')}
                </td>
              )}
              {columns.map((col, i) => (
                <td
                  key={i}
                  className={cn('px-4 py-3.5 text-sm text-ink-900', alignClasses[col.align ?? 'left'])}
                >
                  {col.cell(item, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
