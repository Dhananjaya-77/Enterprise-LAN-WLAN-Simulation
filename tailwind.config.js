/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          card: '#111827',
          panel: '#151d30',
          border: '#1f293d',
          accent: '#3b82f6',
          neon: '#06b6d4',
          glow: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
