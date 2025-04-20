/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-out-up': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'fade-out-up': 'fade-out-up 0.3s ease-out'
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  safelist: [
    'bg-yellow-400',
    'text-gray-300',
    'hover:text-yellow-400',
    'bg-red-100',
    'bg-amber-100',
    'bg-green-100',
    'text-red-600',
    'text-red-700',
    'text-amber-600',
    'text-amber-700',
    'text-green-600',
    'text-green-700',
    'hover:bg-teal-50',
    'hover:bg-teal-600',
    'hover:bg-teal-700',
    'hover:text-teal-500',
    'hover:text-teal-800',
    'from-blue-500',
    'to-blue-600',
    'from-green-500',
    'to-green-600',
    'from-red-500',
    'to-red-600',
    'from-purple-500',
    'to-purple-600',
    'bg-blue-100',
    'bg-red-100',
    'bg-yellow-100',
    'bg-purple-100',
    'text-blue-800',
    'text-red-800',
    'text-yellow-800',
    'text-purple-800',
    'text-blue-100',
    'text-red-100',
    'text-green-100',
    'text-purple-100',
    'text-yellow-500',
    'animate-fade-in-down',
    'animate-fade-out-up'
  ],
  plugins: [],
}

