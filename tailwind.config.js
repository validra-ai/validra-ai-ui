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
        pass: {
          DEFAULT: '#22c55e',
          bg: '#052e16',
          border: '#166534',
          text: '#86efac',
        },
        fail: {
          DEFAULT: '#ef4444',
          bg: '#2d0000',
          border: '#991b1b',
          text: '#fca5a5',
        },
        warn: {
          DEFAULT: '#f59e0b',
          bg: '#2d1a00',
          border: '#92400e',
          text: '#fcd34d',
        },
      },
    },
  },
  plugins: [],
}
