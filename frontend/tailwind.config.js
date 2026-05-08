/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display: serif elegante para títulos e branding
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        // Sans: distintiva mas legível para corpo de texto e UI
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Mono: para códigos de sessão, IDs, dados tabulares
        mono: ['"Geist Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        // Paleta RUTh: papel + tinta + carimbo
        ink: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Carimbo: amber pra ações e marcações de validação
        stamp: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
