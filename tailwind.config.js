const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans]
      },
      animation: {
        'toast-in': 'toastIn 0.5s linear forwards',
        'toast-out': 'toastOut 0.5s linear forwards'
      },
      keyframes: {
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(30%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(30%)' }
        },
        translate: {
          '0%': {
            transform: 'translateY(30%)'
          },
          '100%': {
            transform: 'translateY(0)'
          }
        }
      },
      colors: {
        sky: colors.sky,
        teal: colors.teal
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio')
  ]
}
