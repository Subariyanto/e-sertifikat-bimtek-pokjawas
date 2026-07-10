/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kemenag-green': '#064E3B',
        'kemenag-gold': '#D4AF37',
        'kemenag-navy': '#0F172A',
      },
    },
  },
  plugins: [],
}
