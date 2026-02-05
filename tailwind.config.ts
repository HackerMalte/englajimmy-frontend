import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Le Jour Script", cursive'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#faf8f5',
        charcoal: '#1a1a1a',
        ink: '#2c2c2c',
        stone: '#6b6b6b',
        border: '#e5e5e5',
        'pastel-green': '#bcbfab',
        'pastel-pink': '#d4a6a8',
        'gul': "#f3dbaa",
      },
    },
  },
  plugins: [],
}
export default config
