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
        border: '#23272f',
        surface: '#18181b',
        muted: '#6b7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Poppins', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.08)',
        navbar: '0 2px 8px 0 rgba(0,0,0,0.10)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
