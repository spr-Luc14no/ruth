interface CodigoSessaoDisplayProps {
  codigo: string;
}

export function CodigoSessaoDisplay({ codigo }: CodigoSessaoDisplayProps) {
  return (
    <div className="text-center">
      <p className="section-number mb-4">código de entrada</p>
      <div className="inline-flex items-center justify-center gap-3">
        {codigo.split('').map((char, i) => (
          <div
            key={i}
            className="relative flex h-32 w-24 items-center justify-center rounded-md border-2 border-primary-500/40 bg-bg-elevated font-mono text-7xl font-medium tabular-nums text-fg-primary shadow-glow-primary"
          >
            {/* Glow interno sutil */}
            <span
              className="pointer-events-none absolute inset-0 rounded-md opacity-30"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(127, 0, 255, 0.25), transparent 60%)',
              }}
              aria-hidden
            />
            <span className="relative">{char}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-fg-muted">
        Compartilhe este código com a turma para o check-in.
      </p>
    </div>
  );
}
