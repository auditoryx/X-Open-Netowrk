/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#14b8a6',
        ebony: '#0B0B0B',
        panel: '#111315',
        brand: {
          DEFAULT: '#BA8CFF',
          dark: '#7A4FCC',
        },
        accent: {
          gold: '#D4AF37',
          green: '#10B981',
        },
        neutral: {
          dark: '#1c1c1e',
          light: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Poppins', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
