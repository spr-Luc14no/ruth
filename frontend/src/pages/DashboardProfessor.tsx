import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, BarChart3, Bell, Calendar, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Badge } from '@/components/ui/Badge';
import { sessoesApi, extractErrorMessage } from '@/services/api';
import type { SessaoBasica } from '@/types';

export default function DashboardProfessor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessoes, setSessoes] = useState<Array<SessaoBasica & { _count: { presencas: number } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessoesApi
      .listar()
      .then(setSessoes)
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const sessaoAtiva = sessoes.find((s) => s.status === 'ABERTA');
  const recentes = sessoes.filter((s) => s.status !== 'ABERTA').slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end animate-slide-up">
          <div>
            <p className="section-number mb-3">painel — docente</p>
            <h1 className="text-display-xl text-fg-primary">
              Bom dia, <span className="text-rgb">{user?.nome.split(' ')[0]}</span>.
            </h1>
            <p className="mt-3 max-w-xl text-base text-fg-secondary">
              Inicie uma chamada, dispare interações ou consulte o histórico de presença das suas
              turmas.
            </p>
          </div>
          <div className="rounded-md border border-border bg-bg-elevated p-4">
            <p className="section-number">sessões</p>
            <p className="display mt-1 text-2xl tabular-nums text-fg-primary">
              {loading ? '—' : sessoes.length}
            </p>
            <p className="text-xs text-fg-muted">total acumulado</p>
          </div>
        </section>

        {/* Sessão ativa — destaque */}
        {sessaoAtiva ? (
          <Link
            to={`/professor/sessao/${sessaoAtiva.id}`}
            className="group mb-6 flex flex-wrap items-center justify-between gap-6 rounded-md border-2 border-primary-500/50 bg-bg-elevated p-6 shadow-glow-primary transition-all hover:border-primary-500 hover:bg-bg-hover"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-primary-500/15 p-3">
                <PlayCircle size={24} className="text-primary-400" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="indicator-live">ao vivo</span>
                  <span className="font-mono text-xs text-fg-muted">
                    código: {sessaoAtiva.codigo}
                  </span>
                </div>
                <p className="display text-2xl text-fg-primary">{sessaoAtiva.turma.nome}</p>
                <p className="text-sm text-fg-muted">
                  {sessaoAtiva._count.presencas}{' '}
                  {sessaoAtiva._count.presencas === 1 ? 'presença' : 'presenças'} registradas
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-fg-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-400"
            />
          </Link>
        ) : (
          <button
            onClick={() => navigate('/professor/sessao/iniciar')}
            className="group mb-6 flex w-full items-center justify-between rounded-md border-2 border-dashed border-border-strong bg-bg-elevated/40 p-8 text-left transition-all hover:border-primary-500/60 hover:bg-bg-elevated hover:shadow-glow-soft"
          >
            <div className="flex items-center gap-6">
              <div className="rounded-full bg-bg-elevated p-4 transition-all group-hover:bg-primary-500/15">
                <PlayCircle size={28} className="text-fg-secondary transition-colors group-hover:text-primary-400" />
              </div>
              <div>
                <p className="display text-3xl text-fg-primary">Iniciar chamada</p>
                <p className="mt-1 text-sm text-fg-muted">
                  Abra uma sessão pra uma turma e gere o código de check-in.
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-fg-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-400"
            />
          </button>
        )}

        {/* Histórico recente */}
        {recentes.length > 0 && (
          <section className="mb-8">
            <p className="section-number mb-3">sessões recentes</p>
            <ul className="space-y-2">
              {recentes.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-fg-primary">{s.turma.nome}</p>
                    <p className="font-mono text-xs text-fg-muted">
                      #{s.id} · {new Date(s.dataAbertura).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="neutral">{s._count.presencas} presenças</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cards menores */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-bg-elevated p-5">
            <Calendar size={18} className="mb-3 text-fg-muted" />
            <p className="display text-xl text-fg-secondary">Histórico</p>
            <p className="mt-1 text-xs text-fg-muted">Sessões anteriores e presenças.</p>
          </div>
          <div className="rounded-md border border-border bg-bg-elevated p-5">
            <BarChart3 size={18} className="mb-3 text-fg-muted" />
            <p className="display text-xl text-fg-secondary">Relatórios</p>
            <p className="mt-1 text-xs text-fg-muted">Exportação em CSV ou PDF (PR6).</p>
          </div>
          <div className="rounded-md border border-border bg-bg-elevated p-5">
            <Bell size={18} className="mb-3 text-fg-muted" />
            <p className="display text-xl text-fg-secondary">Interações</p>
            <p className="mt-1 text-xs text-fg-muted">Disponíveis dentro de uma sessão ativa.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
