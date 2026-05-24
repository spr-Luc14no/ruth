import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Users, Pencil, Trash2, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  turmasApi,
  disciplinasApi,
  usuariosApi,
  extractErrorMessage,
} from '@/services/api';
import type { TurmaDetalhe as TTurmaDetalhe, DisciplinaResumo, Usuario } from '@/types';

export default function TurmaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const turmaId = Number(id);

  const [turma, setTurma] = useState<TTurmaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Usuario[]>([]);

  // Disciplina form
  const [discOpen, setDiscOpen] = useState(false);
  const [discEdit, setDiscEdit] = useState<DisciplinaResumo | null>(null);
  const [discNome, setDiscNome] = useState('');
  const [discProf, setDiscProf] = useState<number | ''>('');
  const [discTol, setDiscTol] = useState('');
  const [discJanela, setDiscJanela] = useState('');
  const [discSaving, setDiscSaving] = useState(false);
  const [discError, setDiscError] = useState<string | null>(null);
  const [discDelete, setDiscDelete] = useState<DisciplinaResumo | null>(null);

  // Matricula
  const [matricularOpen, setMatricularOpen] = useState(false);
  const [alunoSel, setAlunoSel] = useState<number | ''>('');
  const [matriculando, setMatriculando] = useState(false);
  const [desmatricular, setDesmatricular] = useState<{ id: number; nome: string } | null>(null);

  async function carregar() {
    setLoading(true);
    try {
      const t = await turmasApi.buscar(turmaId);
      setTurma(t);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    usuariosApi.listar({ tipo: 'P', status: 'A' }).then(setProfessores).catch(() => {});
    usuariosApi.listar({ tipo: 'U', status: 'A' }).then(setAlunosDisponiveis).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId]);

  // ---- Disciplina ----
  function abrirCriarDisc() {
    setDiscEdit(null);
    setDiscNome('');
    setDiscProf('');
    setDiscTol('');
    setDiscJanela('');
    setDiscError(null);
    setDiscOpen(true);
  }
  function abrirEditarDisc(d: DisciplinaResumo) {
    setDiscEdit(d);
    setDiscNome(d.nome);
    setDiscProf(d.professorId);
    setDiscTol(d.toleranciaAtrasoMin?.toString() ?? '');
    setDiscJanela(d.janelaPadraoMin?.toString() ?? '');
    setDiscError(null);
    setDiscOpen(true);
  }
  async function salvarDisc(e: React.FormEvent) {
    e.preventDefault();
    setDiscError(null);
    if (!discNome.trim() || !discProf) {
      setDiscError('Preencha o nome e escolha o professor.');
      return;
    }
    setDiscSaving(true);
    try {
      const payload = {
        nome: discNome.trim(),
        professorId: Number(discProf),
        toleranciaAtrasoMin: discTol ? Number(discTol) : null,
        janelaPadraoMin: discJanela ? Number(discJanela) : null,
      };
      if (discEdit) {
        await disciplinasApi.atualizar(discEdit.id, payload);
        toast.success('Disciplina atualizada.');
      } else {
        await disciplinasApi.criar({ ...payload, turmaId });
        toast.success('Disciplina criada.');
      }
      setDiscOpen(false);
      carregar();
    } catch (err) {
      setDiscError(extractErrorMessage(err));
    } finally {
      setDiscSaving(false);
    }
  }
  async function confirmarDeleteDisc() {
    if (!discDelete) return;
    try {
      await disciplinasApi.excluir(discDelete.id);
      toast.success('Disciplina excluída.');
      setDiscDelete(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  // ---- Matricula ----
  async function matricular(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoSel) return;
    setMatriculando(true);
    try {
      await turmasApi.matricular(turmaId, Number(alunoSel));
      toast.success('Aluno matriculado.');
      setMatricularOpen(false);
      setAlunoSel('');
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setMatriculando(false);
    }
  }
  async function confirmarDesmatricular() {
    if (!desmatricular) return;
    try {
      await turmasApi.desmatricular(turmaId, desmatricular.id);
      toast.success('Aluno removido da turma.');
      setDesmatricular(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const matriculadosIds = new Set(turma?.matriculas.map((m) => m.alunoId) ?? []);
  const naoMatriculados = alunosDisponiveis.filter((a) => !matriculadosIds.has(a.id));

  if (loading) {
    return (
      <AdminShell>
        <div className="card-vault p-12 text-center text-sm text-fg-muted">Carregando…</div>
      </AdminShell>
    );
  }
  if (!turma) {
    return (
      <AdminShell>
        <div className="card-vault p-12 text-center text-sm text-fg-muted">Turma não encontrada.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Link
        to="/admin/turmas"
        className="mb-6 inline-flex items-center gap-2 text-sm text-fg-secondary hover:text-fg-primary"
      >
        <ArrowLeft size={14} />
        Voltar às turmas
      </Link>

      <header className="mb-8 animate-slide-up">
        <p className="section-number mb-3">turma</p>
        <h1 className="text-display-lg text-fg-primary">{turma.nome}</h1>
        <p className="mt-1 font-mono text-sm text-fg-muted">{turma.periodo}</p>
      </header>

      {/* Disciplinas */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display flex items-center gap-2 text-2xl text-fg-primary">
            <BookOpen size={18} className="text-primary-400" />
            Disciplinas
          </h2>
          <Button size="sm" onClick={abrirCriarDisc}>
            <Plus size={14} />
            Nova disciplina
          </Button>
        </div>

        {turma.disciplinas.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-elevated/40 p-8 text-center text-sm text-fg-muted">
            Nenhuma disciplina ainda. Crie a primeira e associe um professor.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {turma.disciplinas.map((d) => (
              <li key={d.id} className="card-vault p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="display text-xl text-fg-primary">{d.nome}</h3>
                    <p className="text-sm text-fg-secondary">{d.professor.nome}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d._count && <Badge variant="neutral">{d._count.sessoes} sessões</Badge>}
                      {d.toleranciaAtrasoMin != null && (
                        <Badge variant="primary">tol. {d.toleranciaAtrasoMin}min</Badge>
                      )}
                      {d.janelaPadraoMin != null && (
                        <Badge variant="primary">janela {d.janelaPadraoMin}min</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => abrirEditarDisc(d)}
                      className="rounded-sm p-1.5 text-fg-muted hover:bg-bg-hover hover:text-primary-400"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDiscDelete(d)}
                      className="rounded-sm p-1.5 text-fg-muted hover:bg-bg-hover hover:text-accent-400"
                      aria-label="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Matrículas */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display flex items-center gap-2 text-2xl text-fg-primary">
            <Users size={18} className="text-primary-400" />
            Alunos matriculados
            <span className="font-mono text-sm text-fg-muted">({turma.matriculas.length})</span>
          </h2>
          <Button size="sm" variant="secondary" onClick={() => setMatricularOpen(true)}>
            <UserPlus size={14} />
            Matricular
          </Button>
        </div>

        {turma.matriculas.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-elevated/40 p-8 text-center text-sm text-fg-muted">
            Nenhum aluno matriculado. Use "Matricular" ou importe via CSV na tela de turmas.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {turma.matriculas.map((m) => (
              <li key={m.alunoId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg-primary">{m.aluno.nome}</p>
                  <p className="font-mono text-[11px] text-fg-muted">
                    {m.aluno.matricula ?? '—'} · {m.aluno.email}
                  </p>
                </div>
                <button
                  onClick={() => setDesmatricular({ id: m.alunoId, nome: m.aluno.nome })}
                  className="rounded-sm p-1.5 text-fg-muted hover:bg-bg-hover hover:text-accent-400"
                  aria-label="Remover"
                >
                  <UserMinus size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal disciplina */}
      <Modal
        open={discOpen}
        onClose={() => setDiscOpen(false)}
        title={discEdit ? 'Editar disciplina' : 'Nova disciplina'}
        description="A disciplina é uma matéria desta turma, com seu professor responsável."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDiscOpen(false)} disabled={discSaving}>
              Cancelar
            </Button>
            <Button type="submit" form="disc-form" loading={discSaving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="disc-form" onSubmit={salvarDisc} className="space-y-4" noValidate>
          <Input
            label="Nome da disciplina"
            marker="01"
            value={discNome}
            onChange={(e) => setDiscNome(e.target.value)}
            placeholder="Ex: Arquitetura de Software"
            disabled={discSaving}
            required
            autoFocus
          />
          <Select
            label="Professor responsável"
            marker="02"
            value={discProf}
            onChange={(e) => setDiscProf(e.target.value ? Number(e.target.value) : '')}
            options={professores.map((p) => ({ value: p.id, label: p.nome }))}
            placeholder="Escolha um professor"
            disabled={discSaving}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Tolerância de atraso (min)"
              marker="03"
              type="number"
              value={discTol}
              onChange={(e) => setDiscTol(e.target.value)}
              placeholder="usa o padrão global"
              hint="Opcional — sobrescreve o global"
              disabled={discSaving}
            />
            <Input
              label="Janela padrão (min)"
              marker="04"
              type="number"
              value={discJanela}
              onChange={(e) => setDiscJanela(e.target.value)}
              placeholder="usa o padrão global"
              hint="Opcional — sobrescreve o global"
              disabled={discSaving}
            />
          </div>
          {discError && (
            <div className="rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-sm text-accent-400">
              {discError}
            </div>
          )}
        </form>
      </Modal>

      {/* Modal matricular */}
      <Modal
        open={matricularOpen}
        onClose={() => setMatricularOpen(false)}
        title="Matricular aluno"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMatricularOpen(false)} disabled={matriculando}>
              Cancelar
            </Button>
            <Button type="submit" form="matricular-form" loading={matriculando} disabled={!alunoSel}>
              Matricular
            </Button>
          </>
        }
      >
        <form id="matricular-form" onSubmit={matricular} noValidate>
          <Select
            label="Aluno"
            marker="01"
            value={alunoSel}
            onChange={(e) => setAlunoSel(e.target.value ? Number(e.target.value) : '')}
            options={naoMatriculados.map((a) => ({
              value: a.id,
              label: `${a.nome}${a.matricula ? ` · ${a.matricula}` : ''}`,
            }))}
            placeholder={naoMatriculados.length ? 'Escolha um aluno' : 'Todos já matriculados'}
            disabled={matriculando || naoMatriculados.length === 0}
            required
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!discDelete}
        onClose={() => setDiscDelete(null)}
        onConfirm={confirmarDeleteDisc}
        title="Excluir disciplina"
        description={`A disciplina "${discDelete?.nome}" será removida. Só é possível se não houver sessões.`}
        confirmLabel="Excluir"
        destructive
      />

      <ConfirmDialog
        open={!!desmatricular}
        onClose={() => setDesmatricular(null)}
        onConfirm={confirmarDesmatricular}
        title="Remover da turma"
        description={`${desmatricular?.nome} será removido desta turma.`}
        confirmLabel="Remover"
        destructive
      />
    </AdminShell>
  );
}
