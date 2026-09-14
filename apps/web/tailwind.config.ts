import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6fc',
          100: '#e2eaf7',
          200: '#c3d5ef',
          300: '#95b6e0',
          400: '#5f8fcb',
          500: '#3c6db3',
          600: '#2c5497',
          700: '#26437a',
          800: '#233a66',
          900: '#213257',
          950: '#151f38',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
