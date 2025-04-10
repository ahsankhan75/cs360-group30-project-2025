/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
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
    'hover:text-teal-800'
  ],
  plugins: [],
}

