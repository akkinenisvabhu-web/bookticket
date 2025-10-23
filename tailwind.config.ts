// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  // This part is CRUCIAL. It tells Tailwind where to look for class names.
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        'primary-blue': 'var(--color-primary-blue)',
        'off-white': 'var(--color-off-white)',
        'dark-blue': 'var(--color-dark-blue)',
        'accent-teal': 'var(--color-accent-teal)',
        'neon-pink': 'var(--color-neon-pink)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-light': 'pulseLight 1.5s infinite alternate',
        // ADDED: Standard Tailwind 'pulse' animation definition
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseLight: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        // ADDED: Standard Tailwind 'pulse' keyframes
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        }
      }
    },
  },
  plugins: [],
}

export default config