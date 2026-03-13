/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bcc: {
          red: '#B91C1C',
          'red-dark': '#991B1B',
          navy: '#1E3A5F',
          'navy-dark': '#162D4A',
          gold: '#C9A84C',
          cream: '#FDF8F0',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            600: '#4B5563',
            700: '#374151',
            900: '#111827',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
}
