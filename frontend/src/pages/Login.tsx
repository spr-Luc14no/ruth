import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { extractErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Já logado? Vai pra dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginInput.trim() || !senha) {
      setErrorMessage('Preencha login e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const usuario = await login(loginInput.trim(), senha);
      toast.success(`Bem-vindo, ${usuario.nome.split(' ')[0]}.`);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* ============ HERO EDITORIAL ============ */}
        <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16">
          {/* Textura sutil de papel */}
          <div className="paper-texture absolute inset-0 opacity-60" aria-hidden="true" />

          {/* Marcações decorativas — números pequenos como códigos de chamada */}
          <div className="pointer-events-none absolute right-12 top-32 select-none font-mono text-[10px] uppercase tracking-[0.3em] text-ink-400">
            <div>cod. 0xff</div>
            <div className="mt-1 text-stamp-600">✓ presente</div>
          </div>
          <div className="pointer-events-none absolute right-20 top-1/2 select-none font-mono text-[10px] uppercase tracking-[0.3em] text-ink-300">
            cod. 1e37
          </div>

          {/* Linha vertical decorativa */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-px bg-ink-200"
            aria-hidden="true"
          />

          {/* Header */}
          <header className="relative flex items-center justify-between">
            <Logo size="md" />
            <span className="section-number">v0.1 · 2026</span>
          </header>

          {/* Tipografia hero */}
          <div className="relative animate-slide-up">
            <p className="section-number mb-6">001 — Sistema de chamada interativa</p>
            <h1 className="display text-[64px] leading-[1.05] tracking-tightest text-ink-900 xl:text-[80px]">
              A chamada,
              <br />
              <span className="italic text-stamp-600">reinventada</span>
              <br />
              em tempo real.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ink-600">
              O <span className="font-medium text-ink-900">RUTh</span> substitui a
              papelada da chamada por sessões com janela de tempo, validação por
              interação e relatórios automáticos. Para professores que querem o tempo
              de aula de volta.
            </p>
          </div>

          {/* Footer da aside */}
          <footer className="relative flex items-end justify-between">
            <div className="space-y-1">
              <p className="section-number">Trabalho final</p>
              <p className="text-sm text-ink-700">Arquitetura de Software</p>
            </div>
            <div className="text-right">
              <p className="section-number">Equipe</p>
              <p className="text-sm text-ink-700">5 dev · 1 sistema</p>
            </div>
          </footer>
        </aside>

        {/* ============ FORMULÁRIO ============ */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm animate-fade-in">
            {/* Logo mobile (aside fica oculta) */}
            <div className="mb-12 lg:hidden">
              <Logo size="lg" />
            </div>

            <div className="mb-8">
              <p className="section-number mb-3">002 — Acesso</p>
              <h2 className="display text-4xl tracking-tightest text-ink-900">Entre na sua conta</h2>
              <p className="mt-2 text-sm text-ink-600">
                Use suas credenciais institucionais.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Login ou e-mail"
                marker="01"
                type="text"
                autoComplete="username"
                placeholder="admin"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                disabled={submitting}
                required
              />

              <Input
                label="Senha"
                marker="02"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={submitting}
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-ink-500 hover:text-ink-900"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              <Button type="submit" size="lg" loading={submitting} className="w-full">
                {submitting ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-8 border-t border-ink-200 pt-6">
              <p className="text-xs text-ink-500">
                Esqueceu sua senha? Entre em contato com a coordenação para redefinir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
