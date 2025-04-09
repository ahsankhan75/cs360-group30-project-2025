/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-yellow-400',
    'text-gray-300',
    'hover:text-yellow-400'
  ],
  plugins: [],
}

