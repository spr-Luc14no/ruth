import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { usuariosApi, extractErrorMessage } from '@/services/api';
import { PERFIL_LABELS, type Usuario, type Perfil, type StatusUsuario } from '@/types';

interface UsuarioFormState {
  open: boolean;
  modo: 'criar' | 'editar';
  usuario: Usuario | null;
  nome: string;
  email: string;
  login: string;
  senha: string;
  tipo: Perfil;
  matricula: string;
}

const initialForm: Omit<UsuarioFormState, 'modo' | 'usuario' | 'open'> = {
  nome: '',
  email: '',
  login: '',
  senha: '',
  tipo: 'U',
  matricula: '',
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<Perfil | ''>('');
  const [filtroStatus, setFiltroStatus] = useState<StatusUsuario | ''>('');
  const [busca, setBusca] = useState('');

  const [form, setForm] = useState<UsuarioFormState>({
    open: false,
    modo: 'criar',
    usuario: null,
    ...initialForm,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [bloqueando, setBloqueando] = useState<Usuario | null>(null);
  const [acaoLoading, setAcaoLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const lista = await usuariosApi.listar({
        tipo: filtroTipo || undefined,
        status: filtroStatus || undefined,
        busca: busca || undefined,
      });
      setUsuarios(lista);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroStatus, busca]);

  function abrirCriar() {
    setForm({ open: true, modo: 'criar', usuario: null, ...initialForm });
    setFormError(null);
  }

  function abrirEditar(u: Usuario) {
    setForm({
      open: true,
      modo: 'editar',
      usuario: u,
      nome: u.nome,
      email: u.email,
      login: u.login,
      senha: '',
      tipo: u.tipo,
      matricula: u.matricula ?? '',
    });
    setFormError(null);
  }

  function fecharForm() {
    setForm((s) => ({ ...s, open: false }));
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        login: form.login.trim(),
        tipo: form.tipo,
        matricula: form.matricula.trim() || null,
      };

      if (form.modo === 'criar') {
        await usuariosApi.criar({ ...payload, senha: form.senha });
        toast.success('Usuário criado.');
      } else if (form.usuario) {
        const update = { ...payload };
        if (form.senha) Object.assign(update, { senha: form.senha });
        await usuariosApi.atualizar(form.usuario.id, update);
        toast.success('Usuário atualizado.');
      }

      fecharForm();
      carregar();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmarAcao() {
    if (!bloqueando) return;
    setAcaoLoading(true);
    try {
      if (bloqueando.status === 'A') {
        await usuariosApi.bloquear(bloqueando.id);
        toast.success('Usuário bloqueado.');
      } else {
        await usuariosApi.reativar(bloqueando.id);
        toast.success('Usuário reativado.');
      }
      setBloqueando(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setAcaoLoading(false);
    }
  }

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slide-up">
        <div>
          <p className="section-number mb-3">administração — 01</p>
          <h1 className="text-display-lg text-fg-primary">Usuários</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Cadastro, edição e bloqueio. {usuarios.length}{' '}
            {usuarios.length === 1 ? 'registro' : 'registros'}.
          </p>
        </div>
        <Button onClick={abrirCriar}>
          <Plus size={14} />
          Novo usuário
        </Button>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome, email ou login…"
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo((e.target.value || '') as Perfil | '')}
          options={[
            { value: '', label: 'Todos os perfis' },
            { value: 'A', label: 'Administrador' },
            { value: 'P', label: 'Professor' },
            { value: 'U', label: 'Aluno' },
          ]}
        />
        <Select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus((e.target.value || '') as StatusUsuario | '')}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'A', label: 'Ativo' },
            { value: 'B', label: 'Bloqueado' },
          ]}
        />
      </div>

      {loading ? (
        <div className="rounded-md border border-border bg-bg-elevated p-12 text-center text-sm text-fg-muted">
          Carregando…
        </div>
      ) : (
        <Table
          columns={[
            {
              header: 'nome',
              cell: (u: Usuario) => (
                <div>
                  <p className="font-medium text-fg-primary">{u.nome}</p>
                  <p className="font-mono text-[11px] text-fg-muted">{u.login}</p>
                </div>
              ),
            },
            { header: 'email', cell: (u: Usuario) => u.email },
            {
              header: 'matrícula',
              cell: (u: Usuario) => (
                <span className="font-mono text-xs text-fg-secondary">
                  {u.matricula ?? '—'}
                </span>
              ),
            },
            {
              header: 'perfil',
              cell: (u: Usuario) => (
                <Badge variant={u.tipo === 'A' ? 'accent' : u.tipo === 'P' ? 'primary' : 'neutral'}>
                  {PERFIL_LABELS[u.tipo]}
                </Badge>
              ),
            },
            {
              header: 'status',
              cell: (u: Usuario) => (
                <Badge variant={u.status === 'A' ? 'success' : 'danger'}>
                  {u.status === 'A' ? 'ativo' : 'bloqueado'}
                </Badge>
              ),
            },
            {
              header: '',
              align: 'right',
              cell: (u: Usuario) => (
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => abrirEditar(u)}
                    className="rounded-sm p-1.5 text-fg-muted transition-colors hover:bg-bg-hover hover:text-primary-400"
                    aria-label="Editar"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setBloqueando(u)}
                    className="rounded-sm p-1.5 text-fg-muted transition-colors hover:bg-bg-hover hover:text-accent-400"
                    aria-label={u.status === 'A' ? 'Bloquear' : 'Reativar'}
                  >
                    {u.status === 'A' ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              ),
            },
          ]}
          data={usuarios}
          rowKey={(u: Usuario) => u.id}
          emptyState={
            <EmptyState
              title="Nenhum usuário encontrado"
              description={busca ? 'Tente refinar a busca.' : 'Comece criando o primeiro usuário.'}
            />
          }
        />
      )}

      <Modal
        open={form.open}
        onClose={fecharForm}
        title={form.modo === 'criar' ? 'Novo usuário' : 'Editar usuário'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={fecharForm} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" form="usuario-form" loading={submitting}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="usuario-form" onSubmit={submeter} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              marker="01"
              value={form.nome}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              disabled={submitting}
              required
            />
            <Input
              label="Email"
              marker="02"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              disabled={submitting}
              required
            />
            <Input
              label="Login"
              marker="03"
              value={form.login}
              onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))}
              disabled={submitting}
              required
            />
            <Input
              label={form.modo === 'criar' ? 'Senha' : 'Nova senha (deixe vazio para manter)'}
              marker="04"
              type="password"
              value={form.senha}
              onChange={(e) => setForm((s) => ({ ...s, senha: e.target.value }))}
              disabled={submitting}
              required={form.modo === 'criar'}
              hint={form.modo === 'criar' ? 'Mínimo 8 caracteres' : undefined}
            />
            <Select
              label="Perfil"
              marker="05"
              value={form.tipo}
              onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value as Perfil }))}
              options={[
                { value: 'U', label: 'Aluno' },
                { value: 'P', label: 'Professor' },
                { value: 'A', label: 'Administrador' },
              ]}
              disabled={submitting}
            />
            <Input
              label="Matrícula"
              marker="06"
              value={form.matricula}
              onChange={(e) => setForm((s) => ({ ...s, matricula: e.target.value }))}
              disabled={submitting}
              hint="Apenas para alunos"
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-sm text-accent-400"
            >
              {formError}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!bloqueando}
        onClose={() => setBloqueando(null)}
        onConfirm={confirmarAcao}
        title={bloqueando?.status === 'A' ? 'Bloquear usuário' : 'Reativar usuário'}
        description={
          bloqueando?.status === 'A'
            ? `${bloqueando?.nome} não conseguirá mais acessar o sistema até ser reativado.`
            : `${bloqueando?.nome} voltará a poder acessar o sistema.`
        }
        confirmLabel={bloqueando?.status === 'A' ? 'Bloquear' : 'Reativar'}
        destructive={bloqueando?.status === 'A'}
        loading={acaoLoading}
      />
    </AdminShell>
  );
}
