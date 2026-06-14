/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg-0)',
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        bg3: 'var(--bg-3)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        gold: 'var(--gold)',
        'gold-dim': 'var(--gold-dim)',
        red: 'var(--red)',
        green: 'var(--green)',
        blue: 'var(--blue)',
        amber: 'var(--amber)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px var(--gold-glow)' },
          '50%': { boxShadow: '0 0 20px var(--gold-glow), 0 0 40px var(--gold-glow)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
