import { cn } from '@/lib/cn';
import logoRLock from '@/assets/logo-r-lock.svg';

interface LogoProps {
  className?: string;
  /** Tamanho do ícone em px. Padrão 28 */
  size?: number;
  /** Se mostra o nome ao lado do ícone */
  showName?: boolean;
}

/**
 * Logo RUTh — ícone R-Lock (split diagonal violeta/escarlate com o R
 * geométrico e o "ping" no canto, simbolizando o "aRe U There?").
 * Mantém o acabamento arredondado com borda sutil do tema VAULT.
 */
export function Logo({ className, size = 28, showName = true }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src={logoRLock}
        alt="RUTh"
        width={size}
        height={size}
        className="shrink-0 rounded-md ring-1 ring-border/60"
        style={{ width: size, height: size }}
      />
      {showName && (
        <span className="font-display text-xl font-medium tracking-tight text-fg-primary">
          RUTh
        </span>
      )}
    </div>
  );
}
