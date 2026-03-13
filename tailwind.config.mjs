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
        heading: ['Oswald', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pan-flag': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'pan-flag': 'pan-flag 40s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
