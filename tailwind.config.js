/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./TestApp.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        background: '#f1f5f9',
        'background-dark': '#0f172a',
        primary: '#1e293b', // Bleu nuit
        'primary-light': '#334155',
        secondary: '#2dd4bf', // Turquoise pastel
        accent: '#a78bfa', // Lavande
        highlight: '#f472b6', // Rose
        orange: '#fb923c',
        yellow: '#facc15',
        
        glass: 'rgba(255, 255, 255, 0.3)',
        'glass-dark': 'rgba(30, 41, 59, 0.4)',
        
        'text-main': '#1e293b',
        'text-main-dark': '#e2e8f0',
        'text-muted': '#64748b',
        'text-muted-dark': '#94a3b8',
        
        'border-light': '#e2e8f0',
        'border-dark': '#334155',

        'card-light': '#ffffff',
        'card-dark': '#1e293b',
      },
      boxShadow: {
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'bounce-in': 'bounce-in 0.5s ease-out forwards',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '70%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-slow': {
          '50%': { opacity: '.6' },
        },
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}