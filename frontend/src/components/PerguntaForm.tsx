import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { interacoesApi, extractErrorMessage } from '@/services/api';

interface PerguntaFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  sessaoId: number;
}

interface OpcaoLocal {
  descricao: string;
  correta: boolean;
}

export function PerguntaForm({ open, onClose, onCreated, sessaoId }: PerguntaFormProps) {
  const [enunciado, setEnunciado] = useState('');
  const [opcoes, setOpcoes] = useState<OpcaoLocal[]>([
    { descricao: '', correta: false },
    { descricao: '', correta: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEnunciado('');
    setOpcoes([
      { descricao: '', correta: false },
      { descricao: '', correta: false },
    ]);
    setError(null);
  }, [open]);

  function setDescricao(index: number, descricao: string) {
    setOpcoes((opcoes) => opcoes.map((o, i) => (i === index ? { ...o, descricao } : o)));
  }

  function setCorreta(index: number) {
    setOpcoes((opcoes) => opcoes.map((o, i) => ({ ...o, correta: i === index })));
  }

  function adicionarOpcao() {
    if (opcoes.length >= 6) return;
    setOpcoes((o) => [...o, { descricao: '', correta: false }]);
  }

  function removerOpcao(index: number) {
    if (opcoes.length <= 2) return;
    setOpcoes((o) => o.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!enunciado.trim()) {
      setError('Escreva o enunciado.');
      return;
    }
    if (opcoes.some((o) => !o.descricao.trim())) {
      setError('Preencha todas as alternativas.');
      return;
    }

    setSubmitting(true);
    try {
      await interacoesApi.disparar(sessaoId, {
        enunciado: enunciado.trim(),
        tipo: 'MULTIPLA',
        opcoes: opcoes.map((o) => ({ descricao: o.descricao.trim(), correta: o.correta })),
      });
      toast.success('Pergunta disparada.');
      onCreated();
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
      title="Disparar pergunta"
      description="A pergunta vai aparecer ao vivo na tela dos alunos presentes."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="pergunta-form" loading={submitting}>
            Disparar
          </Button>
        </>
      }
    >
      <form id="pergunta-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Enunciado"
          marker="01"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          placeholder="Ex: Qual o paradigma principal de TypeScript?"
          disabled={submitting}
          required
        />

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label className="text-sm font-medium text-ink-800">Alternativas</label>
            <span className="section-number">02</span>
          </div>
          <p className="mb-3 text-xs text-ink-500">
            Marque a opção correta (opcional — útil para mostrar o gabarito no resumo).
          </p>

          <div className="space-y-2">
            {opcoes.map((opcao, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-sm border border-ink-200 bg-ink-50 px-2 py-1.5"
              >
                <label className="flex shrink-0 cursor-pointer items-center gap-2 pl-1">
                  <input
                    type="radio"
                    name="correta"
                    checked={opcao.correta}
                    onChange={() => setCorreta(i)}
                    className="h-3 w-3 cursor-pointer accent-stamp-600"
                    disabled={submitting}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                    {String.fromCharCode(65 + i)}
                  </span>
                </label>
                <input
                  type="text"
                  value={opcao.descricao}
                  onChange={(e) => setDescricao(i, e.target.value)}
                  placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                  disabled={submitting}
                  className="flex-1 bg-transparent px-2 py-1 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
                {opcoes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removerOpcao(i)}
                    disabled={submitting}
                    className="rounded-sm p-1 text-ink-400 hover:bg-ink-100 hover:text-red-700"
                    aria-label="Remover alternativa"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {opcoes.length < 6 && (
            <button
              type="button"
              onClick={adicionarOpcao}
              disabled={submitting}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-900"
            >
              <Plus size={12} />
              adicionar alternativa
            </button>
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
