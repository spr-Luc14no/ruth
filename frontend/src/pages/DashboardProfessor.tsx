import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, BarChart3, Bell, Calendar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Badge } from '@/components/ui/Badge';
import { sessoesApi, extractErrorMessage } from '@/services/api';
import type { SessaoBasica } from '@/types';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end animate-slide-up">
          <div>
            <p className="section-number mb-3">painel — docente</p>
            <h1 className="display text-5xl tracking-tightest text-ink-900">
              Bom dia, {user?.nome.split(' ')[0]}.
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-600">
              Inicie uma chamada, dispare interações ou consulte o histórico de presença das suas
              turmas.
            </p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-4">
            <p className="section-number">sessões</p>
            <p className="display mt-1 text-2xl tabular-nums text-ink-900">
              {loading ? '—' : sessoes.length}
            </p>
            <p className="text-xs text-ink-500">total acumulado</p>
          </div>
        </section>

        {/* Sessão ativa — destaque */}
        {sessaoAtiva ? (
          <Link
            to={`/professor/sessao/${sessaoAtiva.id}`}
            className="mb-6 flex flex-wrap items-center justify-between gap-6 rounded-sm border-2 border-ink-900 bg-ink-50 p-6 transition-colors hover:bg-ink-100"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-stamp-50 p-3">
                <PlayCircle size={24} className="text-stamp-700" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="stamp">ao vivo</Badge>
                  <span className="font-mono text-xs text-ink-500">
                    código: {sessaoAtiva.codigo}
                  </span>
                </div>
                <p className="display text-2xl text-ink-900">{sessaoAtiva.turma.nome}</p>
                <p className="text-sm text-ink-600">
                  {sessaoAtiva._count.presencas}{' '}
                  {sessaoAtiva._count.presencas === 1 ? 'presença' : 'presenças'} registradas
                </p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-ink-700" />
          </Link>
        ) : (
          <button
            onClick={() => navigate('/professor/sessao/iniciar')}
            className="group mb-6 flex w-full items-center justify-between rounded-sm border-2 border-dashed border-ink-300 bg-ink-50 p-8 text-left transition-colors hover:border-ink-900 hover:bg-ink-100/30"
          >
            <div className="flex items-center gap-6">
              <div className="rounded-full bg-ink-100 p-4 transition-colors group-hover:bg-ink-900 group-hover:text-ink-50">
                <PlayCircle size={28} />
              </div>
              <div>
                <p className="display text-3xl text-ink-900">Iniciar chamada</p>
                <p className="mt-1 text-sm text-ink-600">
                  Abra uma sessão pra uma turma e gere o código de check-in.
                </p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-900" />
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
                  className="flex items-center justify-between gap-3 rounded-sm border border-ink-200 bg-ink-50 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.turma.nome}</p>
                    <p className="font-mono text-xs text-ink-500">
                      #{s.id} · {new Date(s.dataAbertura).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-ink-600">
                    {s._count.presencas} presenças
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cards menores */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <Calendar size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Histórico</p>
            <p className="mt-1 text-xs text-ink-500">Sessões anteriores e presenças.</p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <BarChart3 size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Relatórios</p>
            <p className="mt-1 text-xs text-ink-500">Exportação em CSV ou PDF (PR5).</p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <Bell size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Interações</p>
            <p className="mt-1 text-xs text-ink-500">Disponíveis dentro de uma sessão ativa.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
