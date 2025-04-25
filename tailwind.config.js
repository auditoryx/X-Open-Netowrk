/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // Include src/ structure if applicable
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Example of extending theme with custom colors
        secondary: "#9333EA",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Add plugins if needed
    require("@tailwindcss/typography"),
  ],
};