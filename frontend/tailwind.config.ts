import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        surface: {
          DEFAULT: '#0F0F1A',
          1: '#16162A',
          2: '#1E1E38',
          3: '#252545',
          4: '#2E2E58',
        },
        neon: {
          green:  '#10D9A0',
          purple: '#7C3AED',
          blue:   '#3B82F6',
        },
        // backward-compat primary alias
        primary: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124,58,237,0.4), 0 0 20px rgba(124,58,237,0.2)' },
          '50%':       { boxShadow: '0 0 20px rgba(124,58,237,0.7), 0 0 40px rgba(124,58,237,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':   'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'neon-pulse': 'neon-pulse 2.5s ease-in-out infinite',
        float:        'float 3s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
      },
      boxShadow: {
        'brand-sm': '0 4px 16px rgba(124,58,237,0.35)',
        'brand-md': '0 8px 32px rgba(124,58,237,0.4)',
        'brand-lg': '0 16px 48px rgba(124,58,237,0.45)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
