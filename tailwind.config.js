/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        previewBg: "var(--color-bg)",
        previewText: "var(--color-text)",
        previewBorder: "var(--color-border)",
      }
    },
  },
  plugins: [],
}