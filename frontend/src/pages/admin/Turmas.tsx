import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap, BookOpen, Users, Upload, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImportarAlunosModal } from '@/components/ImportarAlunosModal';
import { turmasApi, extractErrorMessage } from '@/services/api';
import type { TurmaResumo } from '@/types';

export default function Turmas() {
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  const [criarOpen, setCriarOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [importarOpen, setImportarOpen] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      setTurmas(await turmasApi.listar());
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!nome.trim() || !periodo.trim()) {
      setFormError('Preencha nome e período.');
      return;
    }
    setSalvando(true);
    try {
      await turmasApi.criar({ nome: nome.trim(), periodo: periodo.trim() });
      toast.success('Turma criada.');
      setCriarOpen(false);
      setNome('');
      setPeriodo('');
      carregar();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slide-up">
        <div>
          <p className="section-number mb-3">administração — 02</p>
          <h1 className="text-display-lg text-fg-primary">Turmas</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Grupos de alunos. Cada turma contém disciplinas (matérias) com seus professores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportarOpen(true)}>
            <Upload size={14} />
            Importar alunos
          </Button>
          <Button onClick={() => setCriarOpen(true)}>
            <Plus size={14} />
            Nova turma
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="card-vault p-12 text-center text-sm text-fg-muted">Carregando…</div>
      ) : turmas.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma criada"
          description="Crie a primeira turma e depois adicione disciplinas dentro dela."
          action={
            <Button onClick={() => setCriarOpen(true)}>
              <Plus size={14} />
              Nova turma
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link
                to={`/admin/turmas/${t.id}`}
                className="group block h-full rounded-md border border-border bg-bg-elevated p-5 transition-all hover:border-primary-500/60 hover:bg-bg-hover hover:shadow-glow-soft"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="display text-2xl text-fg-primary">{t.nome}</h3>
                    <p className="font-mono text-xs text-fg-muted">{t.periodo}</p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-400"
                  />
                </div>

                <div className="mb-3 flex items-center gap-3 text-xs text-fg-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {t._count.matriculas} alunos
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={12} />
                    {t.disciplinas.length} disciplinas
                  </span>
                </div>

                {t.disciplinas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.disciplinas.slice(0, 4).map((d) => (
                      <Badge key={d.id} variant="primary">
                        {d.nome}
                      </Badge>
                    ))}
                    {t.disciplinas.length > 4 && (
                      <Badge variant="neutral">+{t.disciplinas.length - 4}</Badge>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Modal criar turma */}
      <Modal
        open={criarOpen}
        onClose={() => setCriarOpen(false)}
        title="Nova turma"
        description="Um grupo de alunos. As disciplinas você adiciona depois, dentro da turma."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCriarOpen(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" form="turma-form" loading={salvando}>
              Criar
            </Button>
          </>
        }
      >
        <form id="turma-form" onSubmit={criar} className="space-y-4" noValidate>
          <Input
            label="Nome da turma"
            marker="01"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Engenharia de Software"
            disabled={salvando}
            required
            autoFocus
          />
          <Input
            label="Período"
            marker="02"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            placeholder="Ex: 2026/01"
            disabled={salvando}
            required
          />
          {formError && (
            <div className="rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-sm text-accent-400">
              {formError}
            </div>
          )}
        </form>
      </Modal>

      {/* Modal importar alunos */}
      <ImportarAlunosModal
        open={importarOpen}
        onClose={() => setImportarOpen(false)}
        turmas={turmas}
        onImported={carregar}
      />
    </AdminShell>
  );
}
