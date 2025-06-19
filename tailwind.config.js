/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ebony: '#0B0B0B',
        panel: '#111315',
        brand: { DEFAULT: '#BA8CFF', dark: '#7A4FCC' },
        accent: { gold: '#D4AF37', green: '#10B981' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
      },
      fontFamily: {
        heading: ['Poppins', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
