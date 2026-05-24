import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { disciplinasApi, sessoesApi, extractErrorMessage } from '@/services/api';
import type { DisciplinaDoProfessor } from '@/types';

export default function IniciarSessao() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState<DisciplinaDoProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrindo, setAbrindo] = useState<number | null>(null);

  useEffect(() => {
    disciplinasApi
      .minhas()
      .then(setDisciplinas)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function iniciar(disciplina: DisciplinaDoProfessor) {
    setAbrindo(disciplina.id);
    try {
      const sessao = await sessoesApi.criar({ disciplinaId: disciplina.id });
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
            Escolha uma das suas disciplinas para abrir uma sessão de presença.
          </p>
        </header>

        {loading ? (
          <div className="rounded-md border border-border bg-bg-elevated p-12 text-center text-sm text-fg-muted">
            Carregando suas disciplinas…
          </div>
        ) : disciplinas.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma disciplina atribuída a você"
            description="Peça ao administrador para criar uma disciplina e te associar como professor responsável."
          />
        ) : (
          <ul className="grid gap-3">
            {disciplinas.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-bg-elevated p-5 transition-colors hover:border-primary-500/60"
              >
                <div className="min-w-0">
                  <h3 className="display text-2xl text-fg-primary">{d.nome}</h3>
                  <p className="text-sm text-fg-secondary">{d.turma.nome}</p>
                  <div className="mt-2 flex gap-4 text-xs text-fg-muted">
                    <span className="font-mono">{d.turma.periodo}</span>
                    {d._count && (
                      <>
                        <span>•</span>
                        <span>
                          {d._count.sessoes}{' '}
                          {d._count.sessoes === 1 ? 'sessão' : 'sessões'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => iniciar(d)}
                  loading={abrindo === d.id}
                  disabled={abrindo !== null}
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
