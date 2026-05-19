import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, X, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { turmasApi, usuariosApi, extractErrorMessage } from '@/services/api';
import type { TurmaDetalhe, Usuario, AlunoMatriculado } from '@/types';

export default function TurmaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const turmaId = Number(id);
  const navigate = useNavigate();

  const [turma, setTurma] = useState<TurmaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  const [matriculaOpen, setMatriculaOpen] = useState(false);
  const [removendo, setRemovendo] = useState<AlunoMatriculado | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const data = await turmasApi.buscar(turmaId);
      setTurma(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      navigate('/admin/turmas', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isNaN(turmaId)) {
      navigate('/admin/turmas', { replace: true });
      return;
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId]);

  async function desmatricular() {
    if (!removendo || !turma) return;
    setActionLoading(true);
    try {
      await turmasApi.desmatricular(turma.id, removendo.id);
      toast.success('Aluno desmatriculado.');
      setRemovendo(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<AlunoMatriculado>[] = useMemo(
    () => [
      {
        header: 'Nome',
        cell: (a) => <span className="font-medium text-ink-900">{a.nome}</span>,
      },
      {
        header: 'Matrícula',
        width: 'w-40',
        cell: (a) => (
          <span className="font-mono text-sm text-ink-700">{a.matricula ?? '—'}</span>
        ),
      },
      {
        header: 'E-mail',
        cell: (a) => <span className="text-sm text-ink-600">{a.email}</span>,
      },
      {
        header: 'Status',
        width: 'w-28',
        cell: (a) =>
          a.status === 'A' ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="danger">Bloqueado</Badge>
          ),
      },
      {
        header: '',
        width: 'w-12',
        align: 'right',
        cell: (a) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRemovendo(a);
            }}
            className="rounded-sm p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-700"
            aria-label="Remover matrícula"
          >
            <X size={14} />
          </button>
        ),
      },
    ],
    [],
  );

  if (loading || !turma) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center text-sm text-ink-500">Carregando…</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Breadcrumb / Voltar */}
      <button
        type="button"
        onClick={() => navigate('/admin/turmas')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft size={14} />
        Todas as turmas
      </button>

      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <p className="section-number mb-3">turma — #{turma.id}</p>
        <h1 className="display text-5xl tracking-tightest text-ink-900">{turma.nome}</h1>

        <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ink-200 sm:grid-cols-4">
          <div className="bg-ink-50 px-5 py-4">
            <dt className="section-number">disciplina</dt>
            <dd className="mt-1 text-sm text-ink-900">{turma.disciplina}</dd>
          </div>
          <div className="bg-ink-50 px-5 py-4">
            <dt className="section-number">período</dt>
            <dd className="mt-1 font-mono text-sm text-ink-900">{turma.periodo}</dd>
          </div>
          <div className="bg-ink-50 px-5 py-4">
            <dt className="section-number">professor</dt>
            <dd className="mt-1 text-sm text-ink-900">{turma.professor.nome}</dd>
          </div>
          <div className="bg-ink-50 px-5 py-4">
            <dt className="section-number">sessões</dt>
            <dd className="mt-1 font-mono text-sm text-ink-900">{turma._count.sessoes}</dd>
          </div>
        </dl>
      </header>

      {/* Alunos matriculados */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-number mb-2">matrículas</p>
            <h2 className="display text-3xl tracking-tightest text-ink-900">Alunos</h2>
            <p className="mt-1 text-sm text-ink-600">
              {turma.matriculas.length}{' '}
              {turma.matriculas.length === 1 ? 'aluno matriculado' : 'alunos matriculados'}.
            </p>
          </div>
          <Button onClick={() => setMatriculaOpen(true)}>
            <UserPlus size={16} />
            Matricular aluno
          </Button>
        </div>

        <Table
          data={turma.matriculas.map((m) => m.aluno)}
          columns={columns}
          rowKey={(a) => a.id}
          empty={
            <EmptyState
              icon={UsersIcon}
              title="Nenhum aluno matriculado"
              description="Adicione alunos à turma para que possam registrar presença nas sessões."
              action={
                <Button onClick={() => setMatriculaOpen(true)}>
                  <UserPlus size={16} />
                  Matricular aluno
                </Button>
              }
            />
          }
        />
      </section>

      {/* Modal de matrícula */}
      <MatriculaModal
        open={matriculaOpen}
        onClose={() => setMatriculaOpen(false)}
        onMatriculado={() => {
          setMatriculaOpen(false);
          carregar();
        }}
        turmaId={turma.id}
        alunosJaMatriculados={turma.matriculas.map((m) => m.alunoId)}
      />

      {/* Confirmação de remoção */}
      <ConfirmDialog
        open={Boolean(removendo)}
        onClose={() => setRemovendo(null)}
        onConfirm={desmatricular}
        title="Remover matrícula"
        description={`${removendo?.nome} será desmatriculado(a) desta turma. Esta ação não afeta presenças já registradas. Continuar?`}
        confirmLabel="Remover"
        destructive
        loading={actionLoading}
      />
    </AdminShell>
  );
}

// ============================================
// Modal de matrícula
// ============================================

interface MatriculaModalProps {
  open: boolean;
  onClose: () => void;
  onMatriculado: () => void;
  turmaId: number;
  alunosJaMatriculados: number[];
}

function MatriculaModal({
  open,
  onClose,
  onMatriculado,
  turmaId,
  alunosJaMatriculados,
}: MatriculaModalProps) {
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setAlunoSelecionado('');
    usuariosApi
      .listar({ tipo: 'U', status: 'A' })
      .then((todos) => {
        const disponiveis = todos.filter((a) => !alunosJaMatriculados.includes(a.id));
        setAlunos(disponiveis);
        if (disponiveis[0]) setAlunoSelecionado(String(disponiveis[0].id));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [open, alunosJaMatriculados]);

  async function handleConfirm() {
    if (!alunoSelecionado) {
      setError('Selecione um aluno.');
      return;
    }
    setSubmitting(true);
    try {
      await turmasApi.matricular(turmaId, Number(alunoSelecionado));
      toast.success('Aluno matriculado.');
      onMatriculado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const options = alunos.map((a) => ({
    value: String(a.id),
    label: `${a.nome}${a.matricula ? ` · mat. ${a.matricula}` : ''}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Matricular aluno"
      description="Escolha um aluno cadastrado e ativo para matricular nesta turma."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            loading={submitting}
            disabled={alunos.length === 0 || loading}
          >
            Matricular
          </Button>
        </>
      }
    >
      {loading ? (
        <p className="py-4 text-sm text-ink-500">Carregando alunos…</p>
      ) : alunos.length === 0 ? (
        <p className="py-4 text-sm text-ink-600">
          Não há alunos disponíveis para matricular. Cadastre alunos em <strong>Usuários</strong> ou
          eles já estão todos matriculados nesta turma.
        </p>
      ) : (
        <Select
          label="Aluno"
          marker="01"
          options={options}
          value={alunoSelecionado}
          onChange={(e) => setAlunoSelecionado(e.target.value)}
          disabled={submitting}
        />
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          {error}
        </div>
      )}
    </Modal>
  );
}
