import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { turmasApi, sessoesApi, extractErrorMessage } from '@/services/api';
import type { TurmaResumo } from '@/types';

export default function IniciarSessao() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrindo, setAbrindo] = useState<number | null>(null);

  useEffect(() => {
    turmasApi
      .listar()
      .then(setTurmas)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function iniciar(turma: TurmaResumo) {
    setAbrindo(turma.id);
    try {
      const sessao = await sessoesApi.criar({ turmaId: turma.id });
      toast.success(`Sessão aberta — código ${sessao.codigo}`);
      navigate(`/professor/sessao/${sessao.id}`, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setAbrindo(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-fg-secondary hover:text-fg-primary"
        >
          <ArrowLeft size={14} />
          Voltar ao painel
        </button>

        <header className="mb-10 animate-slide-up">
          <p className="section-number mb-3">chamada — 01</p>
          <h1 className="display text-5xl tracking-tightest text-fg-primary">Iniciar chamada</h1>
          <p className="mt-3 text-base text-fg-secondary">
            Escolha uma das suas turmas para abrir uma sessão de presença.
          </p>
        </header>

        {loading ? (
          <div className="rounded-sm border border-border bg-bg-base p-12 text-center text-sm text-bg-base0">
            Carregando suas turmas…
          </div>
        ) : turmas.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma turma atribuída a você"
            description="Peça ao administrador para criar uma turma e te associar como professor responsável."
          />
        ) : (
          <ul className="grid gap-3">
            {turmas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-sm border border-border bg-bg-base p-5 transition-colors hover:border-primary-500/60"
              >
                <div className="min-w-0">
                  <h3 className="display text-2xl text-fg-primary">{t.nome}</h3>
                  <p className="text-sm text-fg-secondary">{t.disciplina}</p>
                  <div className="mt-2 flex gap-4 text-xs text-bg-base0">
                    <span className="font-mono">{t.periodo}</span>
                    <span>•</span>
                    <span>
                      {t._count.matriculas}{' '}
                      {t._count.matriculas === 1 ? 'aluno matriculado' : 'alunos matriculados'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => iniciar(t)}
                  loading={abrindo === t.id}
                  disabled={abrindo !== null || t._count.matriculas === 0}
                >
                  <PlayCircle size={16} />
                  Abrir chamada
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
