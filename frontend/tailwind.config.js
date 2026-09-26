/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        krishi: {
          light: '#f2f9f1',
          DEFAULT: '#4ade80', // Green for agriculture
          dark: '#166534',
        }
      }
    },
  },
  plugins: [],
}
