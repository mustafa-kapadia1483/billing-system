/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#826017',
          light: '#a67b1d',
          dark: '#5e4511',
          100: '#f4ecd9',
          200: '#e9d9b3',
          300: '#ddc68d',
          400: '#d2b367',
          500: '#c7a041',
          600: '#a88537',
          700: '#896a2d',
          800: '#6a5023',
          900: '#4b3619'
        }
      },
      fontFamily: {
        sans: ['Montserrat Variable', 'sans-serif']
      }
    }
  },
  plugins: []
}
