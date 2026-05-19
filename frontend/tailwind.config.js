/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // dark é o tema padrão, mas mantém suporte explícito
  theme: {
    extend: {
      colors: {
        // ============ Backgrounds ============
        bg: {
          base: '#0A0A0F',      // Preto profundo — fundo principal
          elevated: '#1A1A2E',  // Azul noite — cards, modais, sidebar
          hover: '#22223D',     // Hover de elementos elevated
          subtle: '#13131F',    // Pra seções dentro de cards
        },
        // ============ Primary — Violeta ============
        primary: {
          50: '#F5EBFF',
          100: '#E8D4FF',
          200: '#D4AAFF',
          300: '#B574FF',
          400: '#A455FF',
          500: '#7F00FF',  // Violeta principal — do moodboard
          600: '#6800D9',
          700: '#5400B3',
          800: '#42008A',
          900: '#2D005C',
        },
        // ============ Accent — Escarlate ============
        accent: {
          50: '#FFEAE5',
          100: '#FFCFC2',
          200: '#FF9F85',
          300: '#FF7350',
          400: '#FF5733',
          500: '#FF2400',  // Escarlate principal — do moodboard
          600: '#D81E00',
          700: '#A81700',
          800: '#7A1000',
          900: '#4D0A00',
        },
        // ============ Text ============
        fg: {
          primary: '#E8E8FF',   // Branco frio — texto principal
          secondary: '#A8A8C0', // Cinza-violáceo claro
          muted: '#6E6E80',     // Apagado — placeholders, hints
          subtle: '#4A4A60',    // Quase invisível, separadores textuais
        },
        // ============ Borders ============
        border: {
          DEFAULT: '#2A2A3E',
          strong: '#3A3A5A',
          subtle: '#1F1F30',
        },
        // ============ Semantic ============
        success: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        // ============ Status colors usadas em badges ============
        // (mantém compatibilidade com componentes antigos)
        ink: {
          50: '#0A0A0F',
          100: '#13131F',
          200: '#1A1A2E',
          300: '#22223D',
          400: '#3A3A5A',
          500: '#6E6E80',
          600: '#A8A8C0',
          700: '#E8E8FF',
          800: '#E8E8FF',
          900: '#E8E8FF',
        },
        stamp: {
          50: '#F5EBFF',
          100: '#E8D4FF',
          500: '#7F00FF',
          600: '#6800D9',
          700: '#5400B3',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
      },
      boxShadow: {
        // Glow neon — para hovers e estados ativos
        'glow-primary': '0 0 24px rgba(127, 0, 255, 0.4)',
        'glow-primary-lg': '0 0 40px rgba(127, 0, 255, 0.5)',
        'glow-accent': '0 0 24px rgba(255, 36, 0, 0.4)',
        'glow-accent-lg': '0 0 40px rgba(255, 36, 0, 0.5)',
        'glow-soft': '0 0 16px rgba(127, 0, 255, 0.2)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(255, 36, 0, 0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(255, 36, 0, 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7F00FF 0%, #5400B3 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FF2400 0%, #A81700 100%)',
        'gradient-rgb': 'linear-gradient(90deg, #7F00FF 0%, #FF2400 100%)',
        'gradient-nebula':
          'radial-gradient(ellipse at top, rgba(127, 0, 255, 0.15), transparent 50%), radial-gradient(ellipse at bottom right, rgba(255, 36, 0, 0.1), transparent 50%)',
      },
    },
  },
  plugins: [],
};
