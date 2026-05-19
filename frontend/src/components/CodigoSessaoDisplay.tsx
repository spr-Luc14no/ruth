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
            className="flex h-32 w-24 items-center justify-center rounded-sm border-2 border-ink-900 bg-ink-50 font-mono text-7xl font-medium tabular-nums text-ink-900"
          >
            {char}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-600">
        Compartilhe este código com a turma para o check-in.
      </p>
    </div>
  );
}
