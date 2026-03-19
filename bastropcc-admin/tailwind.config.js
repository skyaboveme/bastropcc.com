/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B22234',
          dark: '#8B1A27',
        },
        secondary: {
          DEFAULT: '#002868',
          dark: '#001A4A',
        },
        accent: '#F5F5DC',
        sidebar: {
          bg: '#002868',
          text: '#EFF6FF',
          active: '#B22234',
        }
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [],
}
