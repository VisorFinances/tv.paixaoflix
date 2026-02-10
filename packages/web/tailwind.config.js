/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../shared/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'paixaoflix': {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
          accent: '#ffc107',
          'accent-hover': '#ff6b6b',
          text: '#ffffff',
          'text-secondary': '#b3b3b3',
          border: '#333333',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-yellow': 'pulseYellow 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseYellow: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 193, 7, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 193, 7, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 193, 7, 0)' },
        },
      },
      screens: {
        'tv': '1920px',
        '4k': '2560px',
      },
    },
  },
  plugins: [],
}
