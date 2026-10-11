/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        brand: {
          purple: '#7c3aed',
          pink: '#ec4899',
          amber: '#f59e0b',
          teal: '#0d9488',
          blue: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
        math: ['"KaTeX_Math"', '"Outfit"', 'Cambria Math', 'serif'],
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'wobble': 'wobble 0.6s ease-in-out',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        wobble: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
