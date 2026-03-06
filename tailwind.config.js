/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        tibetan: ['"Noto Serif Tibetan"', 'serif'],
      },
      colors: {
        saffron: {
          50: '#fef9ec',
          100: '#fdf0c8',
          200: '#fbe08d',
          300: '#f8cb52',
          400: '#f5b72a',
          500: '#ef9a11',
          600: '#d3750c',
          700: '#af540e',
          800: '#8f4212',
          900: '#763712',
          950: '#441b05',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        glow: '0 0 20px rgb(245 183 42 / 0.15)',
      },
    },
  },
  plugins: [],
}
