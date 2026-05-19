import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Ban, RotateCcw, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  usuariosApi,
  extractErrorMessage,
  type CriarUsuarioPayload,
  type AtualizarUsuarioPayload,
} from '@/services/api';
import { PERFIL_LABELS, type Perfil, type StatusUsuario, type Usuario } from '@/types';

const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'A', label: 'Administrador' },
  { value: 'P', label: 'Professor' },
  { value: 'U', label: 'Aluno' },
];

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'A', label: 'Ativos' },
  { value: 'B', label: 'Bloqueados' },
];

const tipoFormOptions = [
  { value: 'P', label: 'Professor' },
  { value: 'U', label: 'Aluno' },
  { value: 'A', label: 'Administrador' },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<Perfil | ''>('');
  const [filtroStatus, setFiltroStatus] = useState<StatusUsuario | ''>('');
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');

  // Modal de criação/edição
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  // Confirmações de bloqueio/reativação
  const [confirm, setConfirm] = useState<{ user: Usuario; action: 'bloquear' | 'reativar' } | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce da busca (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusca(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  async function carregar() {
    setLoading(true);
    try {
      const data = await usuariosApi.listar({
        tipo: filtroTipo || undefined,
        status: filtroStatus || undefined,
        busca: debouncedBusca || undefined,
      });
      setUsuarios(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroStatus, debouncedBusca]);

  function abrirCriar() {
    setEditando(null);
    setFormOpen(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u);
    setFormOpen(true);
  }

  async function executarConfirmacao() {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.action === 'bloquear') {
        await usuariosApi.bloquear(confirm.user.id);
        toast.success('Usuário bloqueado.');
      } else {
        await usuariosApi.reativar(confirm.user.id);
        toast.success('Usuário reativado.');
      }
      setConfirm(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<Usuario>[] = useMemo(
    () => [
      {
        header: 'Nome',
        cell: (u) => (
          <div>
            <p className="font-medium text-ink-900">{u.nome}</p>
            {u.matricula && (
              <p className="font-mono text-[11px] text-ink-500">mat. {u.matricula}</p>
            )}
          </div>
        ),
      },
      {
        header: 'Login / E-mail',
        cell: (u) => (
          <div>
            <p className="text-sm text-ink-700">{u.login}</p>
            <p className="text-xs text-ink-500">{u.email}</p>
          </div>
        ),
      },
      {
        header: 'Tipo',
        width: 'w-40',
        cell: (u) => (
          <Badge variant={u.tipo === 'A' ? 'stamp' : 'neutral'}>{PERFIL_LABELS[u.tipo]}</Badge>
        ),
      },
      {
        header: 'Status',
        width: 'w-28',
        cell: (u) =>
          u.status === 'A' ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="danger">Bloqueado</Badge>
          ),
      },
      {
        header: '',
        width: 'w-40',
        align: 'right',
        cell: (u) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                abrirEditar(u);
              }}
              className="rounded-sm p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            {u.status === 'A' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirm({ user: u, action: 'bloquear' });
                }}
                className="rounded-sm p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-700"
                aria-label="Bloquear"
              >
                <Ban size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirm({ user: u, action: 'reativar' });
                }}
                className="rounded-sm p-1.5 text-ink-500 hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Reativar"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell>
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slide-up">
        <div>
          <p className="section-number mb-3">administração — 01</p>
          <h1 className="display text-5xl tracking-tightest text-ink-900">Usuários</h1>
          <p className="mt-2 text-base text-ink-600">
            Administradores, professores e alunos do sistema.
          </p>
        </div>
        <Button onClick={abrirCriar}>
          <Plus size={16} />
          Novo usuário
        </Button>
      </header>

      {/* Filtros */}
      <section className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <Input
          placeholder="Buscar por nome, e-mail, login ou matrícula…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          trailing={<Search size={14} />}
        />
        <Select
          options={tipoOptions}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo((e.target.value as Perfil) || '')}
        />
        <Select
          options={statusOptions}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus((e.target.value as StatusUsuario) || '')}
        />
      </section>

      {/* Tabela */}
      <Table
        data={usuarios}
        columns={columns}
        rowKey={(u) => u.id}
        loading={loading}
        empty={
          <EmptyState
            icon={UserCircle}
            title="Nenhum usuário encontrado"
            description={
              debouncedBusca || filtroTipo || filtroStatus
                ? 'Ajuste os filtros ou crie um novo usuário.'
                : 'Comece cadastrando seu primeiro professor ou aluno.'
            }
            action={
              <Button onClick={abrirCriar}>
                <Plus size={16} />
                Novo usuário
              </Button>
            }
          />
        }
      />

      {/* Modal de criar/editar */}
      <UsuarioForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          carregar();
        }}
        usuario={editando}
      />

      {/* Confirmação */}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={executarConfirmacao}
        title={confirm?.action === 'bloquear' ? 'Bloquear usuário' : 'Reativar usuário'}
        description={
          confirm?.action === 'bloquear'
            ? `${confirm?.user.nome} não poderá mais acessar o sistema até ser reativado. Continuar?`
            : `Reativar o acesso de ${confirm?.user.nome}?`
        }
        confirmLabel={confirm?.action === 'bloquear' ? 'Bloquear' : 'Reativar'}
        destructive={confirm?.action === 'bloquear'}
        loading={actionLoading}
      />
    </AdminShell>
  );
}

// ============================================
// Form Modal — separado pra deixar a Page legível
// ============================================

interface UsuarioFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  usuario: Usuario | null;
}

function UsuarioForm({ open, onClose, onSaved, usuario }: UsuarioFormProps) {
  const isEdit = Boolean(usuario);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<Perfil>('P');
  const [matricula, setMatricula] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta o form quando abre/fecha ou troca de usuário
  useEffect(() => {
    if (!open) return;
    setNome(usuario?.nome ?? '');
    setEmail(usuario?.email ?? '');
    setLoginInput(usuario?.login ?? '');
    setSenha('');
    setTipo(usuario?.tipo ?? 'P');
    setMatricula(usuario?.matricula ?? '');
    setError(null);
  }, [open, usuario]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (tipo === 'U' && !matricula.trim()) {
      setError('Aluno precisa de matrícula.');
      return;
    }
    if (!isEdit && senha.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && usuario) {
        const payload: AtualizarUsuarioPayload = {
          nome,
          email,
          login: loginInput,
          matricula: tipo === 'U' ? matricula : null,
        };
        if (senha) payload.senha = senha;
        await usuariosApi.atualizar(usuario.id, payload);
        toast.success('Usuário atualizado.');
      } else {
        const payload: CriarUsuarioPayload = {
          nome,
          email,
          login: loginInput,
          senha,
          tipo,
          matricula: tipo === 'U' ? matricula : null,
        };
        await usuariosApi.criar(payload);
        toast.success('Usuário criado.');
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar usuário' : 'Novo usuário'}
      description={isEdit ? `Editando ${usuario?.nome}` : 'Preencha os dados abaixo.'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="usuario-form" loading={submitting}>
            {isEdit ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </>
      }
    >
      <form id="usuario-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            marker="01"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={submitting}
          />
          <Select
            label="Tipo de perfil"
            marker="02"
            options={tipoFormOptions}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Perfil)}
            disabled={submitting || isEdit /* não permitir trocar tipo na edição */}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="E-mail"
            marker="03"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
          <Input
            label="Login"
            marker="04"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
            disabled={submitting}
            hint="Letras, números, ponto, traço ou underline"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={isEdit ? 'Nova senha (opcional)' : 'Senha'}
            marker="05"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required={!isEdit}
            disabled={submitting}
            hint={isEdit ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres'}
          />
          {tipo === 'U' && (
            <Input
              label="Matrícula"
              marker="06"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              disabled={submitting}
            />
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
