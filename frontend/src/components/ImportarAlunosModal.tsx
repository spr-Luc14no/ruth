import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { turmasApi, extractErrorMessage } from '@/services/api';
import type { TurmaResumo, ResultadoImportacao } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  turmas: TurmaResumo[];
  onImported: () => void;
}

const EXEMPLO_CSV = `nome,email,login,matricula
Maria Silva,maria@escola.com,maria,2026100
João Souza,joao@escola.com,joao,2026101`;

export function ImportarAlunosModal({ open, onClose, turmas, onImported }: Props) {
  const [csv, setCsv] = useState('');
  const [turmaId, setTurmaId] = useState<number | ''>('');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setCsv('');
    setTurmaId('');
    setResultado(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function lerArquivo(file: File) {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ''));
    reader.readAsText(file, 'UTF-8');
  }

  async function importar() {
    if (!csv.trim()) {
      toast.error('Cole o CSV ou selecione um arquivo.');
      return;
    }
    setImportando(true);
    setResultado(null);
    try {
      const r = await turmasApi.importarAlunos(csv, turmaId || undefined);
      setResultado(r);
      if (r.criados > 0 || r.matriculados > 0) {
        toast.success(`${r.criados} criados, ${r.matriculados} matriculados.`);
        onImported();
      } else {
        toast('Nenhum aluno novo importado.', { icon: '⚠️' });
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setImportando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Importar alunos via CSV"
      description="Cole o conteúdo CSV ou selecione um arquivo. Cabeçalho: nome, email, matricula (login opcional)."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={importando}>
            Fechar
          </Button>
          <Button onClick={importar} loading={importando} disabled={!csv.trim()}>
            <Upload size={14} />
            Importar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Matricular na turma (opcional)"
          marker="01"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value ? Number(e.target.value) : '')}
          options={turmas.map((t) => ({ value: t.id, label: `${t.nome} · ${t.periodo}` }))}
          placeholder="Apenas criar os alunos (sem matricular)"
          disabled={importando}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-fg-secondary">Conteúdo CSV</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-fg-secondary transition-colors hover:text-primary-400"
            >
              <FileText size={12} />
              selecionar arquivo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) lerArquivo(file);
              }}
            />
          </div>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={EXEMPLO_CSV}
            disabled={importando}
            rows={8}
            className="block w-full rounded-md border border-border bg-bg-base px-3 py-2.5 font-mono text-xs text-fg-primary placeholder:text-fg-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <p className="mt-1.5 text-xs text-fg-muted">
            Senha padrão dos alunos: <span className="font-mono text-primary-400">aluno123</span>{' '}
            (ou coluna senha no CSV).
          </p>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="rounded-md border border-border bg-bg-subtle p-4">
            <div className="mb-3 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-success-400">
                <CheckCircle2 size={14} />
                {resultado.criados} criados
              </span>
              <span className="inline-flex items-center gap-1.5 text-primary-300">
                <CheckCircle2 size={14} />
                {resultado.matriculados} matriculados
              </span>
              <span className="font-mono text-xs text-fg-muted">de {resultado.total} linhas</span>
            </div>

            {resultado.erros.length > 0 && (
              <div className="space-y-1">
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs text-warning-400">
                  <AlertTriangle size={12} />
                  {resultado.erros.length} aviso(s):
                </p>
                <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                  {resultado.erros.map((e, i) => (
                    <li key={i} className="font-mono text-[11px] text-fg-muted">
                      {e.linha > 0 ? `linha ${e.linha} (${e.nome}): ` : ''}
                      {e.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
