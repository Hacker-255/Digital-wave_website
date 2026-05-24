import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070d',
        panel: '#0b1220',
        line: '#1c2a3f',
        cyanwave: '#00d9ff',
        bluewave: '#0877ff',
      },
      boxShadow: {
        glow: '0 0 45px rgba(0, 217, 255, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config;
