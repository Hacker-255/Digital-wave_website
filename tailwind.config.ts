import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070d',
        panel: '#0b1220',
        line: '#1c2a3f',
        cyanwave: '#00d9ff',
        bluewave: '#0877ff',
        surface: '#0a0e1a',
        'surface-alt': '#111827',
      },
      boxShadow: {
        glow: '0 0 45px rgba(0, 217, 255, 0.22)',
        'glow-blue': '0 0 80px rgba(37, 99, 235, 0.18), 0 24px 80px rgba(0, 0, 0, 0.35)',
        card: '0 0 20px rgba(0,0,0,0.3)',
        modal: '0 25px 80px rgba(0,0,0,0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.75', boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
          '50%': { opacity: '1', boxShadow: '0 0 28px rgba(59, 130, 246, 0.35)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
} satisfies Config;
