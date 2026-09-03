/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        card: 'var(--bg-surface)',
        'card-secondary': 'var(--bg-surface-secondary)',
        'card-hover': 'var(--bg-surface-elevated)',
        border: 'var(--border-app)',
        'border-focus': 'var(--border-focus)',
        din: {
          dark: 'var(--bg-app)',
          card: 'var(--bg-surface)',
          surface: 'var(--bg-surface-secondary)',
          elevated: 'var(--bg-surface-elevated)',
          sidebar: 'var(--bg-sidebar)',
          border: 'var(--border-app)',
          'border-subtle': 'var(--border-subtle)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          emerald: '#10b981',
          teal: '#14b8a6',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          amber: '#f59e0b',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 25px -5px var(--color-primary-glow)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
