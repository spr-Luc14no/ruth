import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  /** Tamanho do ícone em px. Padrão 28 */
  size?: number;
  /** Se mostra o nome ao lado do ícone */
  showName?: boolean;
}

/**
 * Logo RUTh — versão "type" usando a tipografia VAULT.
 * O Luciano vai produzir o logo definitivo no estilo V-Lock,
 * por enquanto usamos a marca tipográfica.
 *
 * Composição: um quadrado violeta com a letra R em escarlate por dentro,
 * mais o nome RUTh ao lado em Space Grotesk.
 */
export function Logo({ className, size = 28, showName = true }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-md bg-bg-elevated"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {/* Borda gradient */}
        <span
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(135deg, #7F00FF 0%, #FF2400 100%)',
            padding: '1.5px',
          }}
        >
          <span className="block h-full w-full rounded-md bg-bg-elevated" />
        </span>
        {/* Letra R */}
        <span
          className="relative font-display font-bold tracking-tightest text-fg-primary"
          style={{ fontSize: size * 0.55 }}
        >
          R
        </span>
      </span>
      {showName && (
        <span className="font-display text-xl font-medium tracking-tight text-fg-primary">
          RUTh
        </span>
      )}
    </div>
  );
}
