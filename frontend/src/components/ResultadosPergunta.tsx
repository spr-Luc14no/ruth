import { Check } from 'lucide-react';
import type { ResultadosPergunta as TResultadosPergunta } from '@/types';
import { cn } from '@/lib/cn';

interface Props {
  resultados: TResultadosPergunta;
  /** Mostra qual é a opção correta (só pro professor) */
  mostrarCorreta?: boolean;
}

export function ResultadosPergunta({ resultados, mostrarCorreta = false }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="section-number">resultados em tempo real</p>
        <p className="font-mono text-xs tabular-nums text-fg-muted">
          {resultados.totalRespostas}{' '}
          {resultados.totalRespostas === 1 ? 'resposta' : 'respostas'}
        </p>
      </div>

      <div className="space-y-3">
        {resultados.porOpcao.map((opcao, i) => (
          <div
            key={opcao.opcaoId}
            className={cn(
              'rounded-md border bg-bg-base p-3 transition-colors',
              mostrarCorreta && opcao.correta
                ? 'border-primary-500/40'
                : 'border-border',
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-fg-primary">{opcao.descricao}</span>
                {mostrarCorreta && opcao.correta && (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-primary-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary-300">
                    <Check size={10} />
                    correta
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 font-mono text-xs tabular-nums">
                <span className="text-fg-primary">{opcao.count}</span>
                <span className="text-fg-muted">{opcao.percentual}%</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-bg-elevated">
              <div
                className={cn(
                  'h-full rounded-sm transition-all duration-500 ease-out',
                  mostrarCorreta && opcao.correta
                    ? 'bg-gradient-rgb'
                    : 'bg-primary-500/70',
                )}
                style={{ width: `${opcao.percentual}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
