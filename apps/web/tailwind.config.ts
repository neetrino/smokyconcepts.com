import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '!./app/api/**',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'size-catalog-card-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'size-modal-backdrop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'size-modal-panel-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'size-modal-block-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'size-catalog-card-in': 'size-catalog-card-in 0.5s ease-out both',
        'size-modal-backdrop-in': 'size-modal-backdrop-in 0.38s ease-out both',
        'size-modal-panel-in': 'size-modal-panel-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) both',
        'size-modal-block-in': 'size-modal-block-in 0.42s ease-out both',
      },
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        heading: ['system-ui', '-apple-system', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

