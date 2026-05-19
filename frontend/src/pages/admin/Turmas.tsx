import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Pencil, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  turmasApi,
  usuariosApi,
  extractErrorMessage,
  type CriarTurmaPayload,
  type AtualizarTurmaPayload,
} from '@/services/api';
import type { TurmaResumo, Usuario } from '@/types';

export default function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<TurmaResumo | null>(null);

  const [excluindo, setExcluindo] = useState<TurmaResumo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        turmasApi.listar(),
        usuariosApi.listar({ tipo: 'P', status: 'A' }),
      ]);
      setTurmas(t);
      setProfessores(p);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir() {
    if (!excluindo) return;
    setActionLoading(true);
    try {
      await turmasApi.excluir(excluindo.id);
      toast.success('Turma excluída.');
      setExcluindo(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<TurmaResumo>[] = useMemo(
    () => [
      {
        header: 'Turma',
        cell: (t) => (
          <div>
            <p className="font-medium text-fg-primary">{t.nome}</p>
            <p className="text-xs text-bg-base0">{t.disciplina}</p>
          </div>
        ),
      },
      {
        header: 'Período',
        width: 'w-32',
        cell: (t) => <span className="font-mono text-sm text-fg-primary">{t.periodo}</span>,
      },
      {
        header: 'Professor',
        cell: (t) => <span className="text-sm text-fg-primary">{t.professor?.nome ?? '—'}</span>,
      },
      {
        header: 'Alunos',
        width: 'w-24',
        align: 'center',
        cell: (t) => (
          <span className="font-mono text-sm tabular-nums text-fg-primary">{t._count.matriculas}</span>
        ),
      },
      {
        header: 'Sessões',
        width: 'w-24',
        align: 'center',
        cell: (t) => (
          <span className="font-mono text-sm tabular-nums text-fg-primary">{t._count.sessoes}</span>
        ),
      },
      {
        header: '',
        width: 'w-32',
        align: 'right',
        cell: (t) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditando(t);
                setFormOpen(true);
              }}
              className="rounded-sm p-1.5 text-bg-base0 hover:bg-bg-hover hover:text-fg-primary"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExcluindo(t);
              }}
              className="rounded-sm p-1.5 text-bg-base0 hover:bg-accent-500/10 hover:text-accent-400"
              aria-label="Excluir"
            >
              <Trash2 size={14} />
            </button>
            <ArrowUpRight size={14} className="ml-1 text-fg-muted" />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slide-up">
        <div>
          <p className="section-number mb-3">administração — 02</p>
          <h1 className="display text-5xl tracking-tightest text-fg-primary">Turmas</h1>
          <p className="mt-2 text-base text-fg-secondary">
            Configure turmas, períodos, disciplinas e matrículas de alunos.
          </p>
        </div>
        <Button onClick={() => { setEditando(null); setFormOpen(true); }} disabled={professores.length === 0}>
          <Plus size={16} />
          Nova turma
        </Button>
      </header>

      {professores.length === 0 && !loading && (
        <div className="mb-6 rounded-md border border-primary-500/40 bg-primary-500/10 px-4 py-3 text-sm text-primary-300">
          Você precisa cadastrar ao menos um <strong>professor ativo</strong> antes de criar turmas.{' '}
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            className="underline hover:no-underline"
          >
            Cadastrar professor →
          </button>
        </div>
      )}

      <Table
        data={turmas}
        columns={columns}
        rowKey={(t) => t.id}
        loading={loading}
        onRowClick={(t) => navigate(`/admin/turmas/${t.id}`)}
        empty={
          <EmptyState
            icon={BookOpen}
            title="Nenhuma turma cadastrada"
            description="Crie uma turma e comece a matricular alunos."
            action={
              professores.length > 0 && (
                <Button onClick={() => { setEditando(null); setFormOpen(true); }}>
                  <Plus size={16} />
                  Nova turma
                </Button>
              )
            }
          />
        }
      />

      <TurmaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); carregar(); }}
        turma={editando}
        professores={professores}
      />

      <ConfirmDialog
        open={Boolean(excluindo)}
        onClose={() => setExcluindo(null)}
        onConfirm={excluir}
        title="Excluir turma"
        description={`A turma "${excluindo?.nome}" será removida. Esta ação não pode ser desfeita. Turmas com sessões registradas não podem ser excluídas.`}
        confirmLabel="Excluir"
        destructive
        loading={actionLoading}
      />
    </AdminShell>
  );
}

// ============================================
// Form Modal
// ============================================

interface TurmaFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  turma: TurmaResumo | null;
  professores: Usuario[];
}

function TurmaForm({ open, onClose, onSaved, turma, professores }: TurmaFormProps) {
  const isEdit = Boolean(turma);
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [professorId, setProfessorId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNome(turma?.nome ?? '');
    setPeriodo(turma?.periodo ?? '');
    setDisciplina(turma?.disciplina ?? '');
    setProfessorId(turma?.professorId ? String(turma.professorId) : String(professores[0]?.id ?? ''));
    setError(null);
  }, [open, turma, professores]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!professorId) {
      setError('Selecione um professor.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && turma) {
        const payload: AtualizarTurmaPayload = {
          nome,
          periodo,
          disciplina,
          professorId: Number(professorId),
        };
        await turmasApi.atualizar(turma.id, payload);
        toast.success('Turma atualizada.');
      } else {
        const payload: CriarTurmaPayload = {
          nome,
          periodo,
          disciplina,
          professorId: Number(professorId),
        };
        await turmasApi.criar(payload);
        toast.success('Turma criada.');
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const profOptions = professores.map((p) => ({ value: String(p.id), label: p.nome }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar turma' : 'Nova turma'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="turma-form" loading={submitting}>
            {isEdit ? 'Salvar' : 'Criar turma'}
          </Button>
        </>
      }
    >
      <form id="turma-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nome da turma"
          marker="01"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={submitting}
          placeholder="Ex: Arq Soft - Noturno"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Período"
            marker="02"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            required
            disabled={submitting}
            placeholder="Ex: 2026/1"
          />
          <Input
            label="Disciplina"
            marker="03"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <Select
          label="Professor responsável"
          marker="04"
          options={profOptions}
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          disabled={submitting}
        />

        {error && (
          <div
            role="alert"
            className="rounded-sm border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-sm text-accent-400"
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
