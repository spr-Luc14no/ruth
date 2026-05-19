import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { extractErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: doLogin } = useAuth();

  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!loginInput.trim() || !senha) {
      setError('Preencha login e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const usuario = await doLogin(loginInput.trim(), senha);
      toast.success(`Bem-vindo, ${usuario.nome.split(' ')[0]}!`);
      navigate(fromPath || '/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* Nebulosa de fundo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(127, 0, 255, 0.2), transparent), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(255, 36, 0, 0.12), transparent)',
        }}
        aria-hidden
      />

      <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Logo size={56} showName={false} />
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tightest text-fg-primary">
              RUTh
            </h1>
            <p className="mt-1 text-sm text-fg-muted">Sistema de Chamada Interativa</p>
          </div>

          {/* Card */}
          <div className="rounded-md border border-border bg-bg-elevated/80 p-8 shadow-glow-soft backdrop-blur-sm">
            <header className="mb-6">
              <p className="section-number mb-2">acesso — 01</p>
              <h2 className="display text-2xl text-fg-primary">Entrar na plataforma</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Login ou e-mail"
                marker="01"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="seu.usuario"
                disabled={submitting}
                required
                autoFocus
                autoComplete="username"
              />

              <div className="relative">
                <Input
                  label="Senha"
                  marker="02"
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  disabled={submitting}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((s) => !s)}
                  aria-label={showSenha ? 'Esconder senha' : 'Mostrar senha'}
                  className="absolute right-3 top-9 text-fg-muted transition-colors hover:text-fg-primary"
                  tabIndex={-1}
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-sm text-accent-400"
                >
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" loading={submitting} className="w-full">
                {submitting ? 'Validando…' : 'Entrar'}
              </Button>
            </form>
          </div>

          {/* Demo helper */}
          <details className="mt-6">
            <summary className="cursor-pointer text-center text-xs text-fg-muted transition-colors hover:text-primary-400">
              contas de demonstração
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-md border border-border bg-bg-elevated p-2 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  admin
                </p>
                <p className="mt-1 font-mono text-fg-primary">admin</p>
                <p className="font-mono text-fg-muted">admin123</p>
              </div>
              <div className="rounded-md border border-border bg-bg-elevated p-2 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  professor
                </p>
                <p className="mt-1 font-mono text-fg-primary">moacir</p>
                <p className="font-mono text-fg-muted">prof123</p>
              </div>
              <div className="rounded-md border border-border bg-bg-elevated p-2 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  aluno
                </p>
                <p className="mt-1 font-mono text-fg-primary">ramon</p>
                <p className="font-mono text-fg-muted">aluno123</p>
              </div>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
