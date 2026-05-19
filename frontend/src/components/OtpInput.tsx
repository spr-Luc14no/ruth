import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focused, setFocused] = useState<number | null>(null);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  function setDigit(index: number, digit: string) {
    const clean = digit.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = clean || ' ';
    const next = chars.join('').replace(/\s+$/, '');
    onChange(next);

    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (clean && index === length - 1 && next.length === length) {
      onComplete?.(next);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.padEnd(length, ' ').split('');
      if (chars[index] && chars[index] !== ' ') {
        chars[index] = ' ';
        onChange(chars.join('').replace(/\s+$/, ''));
      } else if (index > 0) {
        chars[index - 1] = ' ';
        onChange(chars.join('').replace(/\s+$/, ''));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, length);
    onChange(pasted);
    if (pasted.length === length) {
      onComplete?.(pasted);
      inputsRef.current[length - 1]?.focus();
    } else if (pasted.length > 0) {
      inputsRef.current[pasted.length]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => {
        const char = value[i] ?? '';
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="text"
            autoComplete="off"
            maxLength={1}
            value={char}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            onFocus={(e) => {
              setFocused(i);
              e.currentTarget.select();
            }}
            onBlur={() => setFocused(null)}
            disabled={disabled}
            aria-label={`Caractere ${i + 1} do código`}
            className={cn(
              'h-20 w-16 rounded-md border-2 bg-bg-elevated text-center font-mono text-4xl font-medium uppercase tabular-nums text-fg-primary',
              'transition-all duration-200 focus:outline-none',
              focused === i
                ? 'border-primary-500 shadow-glow-primary'
                : char
                  ? 'border-primary-500/40'
                  : 'border-border',
              disabled && 'opacity-50',
            )}
          />
        );
      })}
    </div>
  );
}
