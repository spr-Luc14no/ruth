import { Check } from 'lucide-react';
import type { ResultadosPergunta } from '@/types';
import { cn } from '@/lib/cn';

interface Props {
  resultados: ResultadosPergunta;
  /** Mostra qual é a opção correta (só pro professor) */
  mostrarCorreta?: boolean;
}

export function ResultadosPergunta({ resultados, mostrarCorreta = false }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="section-number">resultados em tempo real</p>
        <p className="font-mono text-xs tabular-nums text-ink-600">
          {resultados.totalRespostas}{' '}
          {resultados.totalRespostas === 1 ? 'resposta' : 'respostas'}
        </p>
      </div>

      <div className="space-y-3">
        {resultados.porOpcao.map((opcao, i) => (
          <div key={opcao.opcaoId} className="rounded-sm border border-ink-200 bg-ink-50 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-ink-900">{opcao.descricao}</span>
                {mostrarCorreta && opcao.correta && (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-stamp-50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-stamp-700">
                    <Check size={10} />
                    correta
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 font-mono text-xs tabular-nums">
                <span className="text-ink-900">{opcao.count}</span>
                <span className="text-ink-400">{opcao.percentual}%</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-ink-100">
              <div
                className={cn(
                  'h-full rounded-sm transition-all duration-500 ease-out',
                  mostrarCorreta && opcao.correta ? 'bg-stamp-500' : 'bg-ink-900',
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
