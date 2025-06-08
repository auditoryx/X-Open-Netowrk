/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E1E2F',
        secondary: '#7B61FF',
        accent: '#FFBC00',
        'neutral-light': '#F5F5F5',
        'neutral-dark': '#1A1A1A',
      },
      fontFamily: {
        heading: ['Poppins', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
