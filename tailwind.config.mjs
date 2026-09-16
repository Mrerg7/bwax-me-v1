/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: { 50: '#fbf8f5', 100: '#f3ece4', 200: '#e6d6c6' },
        ink: { 800: '#3a2c28', 900: '#2a1f1c', 950: '#16100e' },
        gold: { 300: '#e3d0ae', 400: '#d1b57e', 500: '#c09a5a' },
        rose: { 600: '#8a5a4e', 700: '#6f4840', 800: '#5a3c36' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      letterSpacing: { widestx: '0.22em' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
