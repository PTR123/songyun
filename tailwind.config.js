/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        // 宋韵主题配色
        'song-bg-dark': '#0a1f2a',
        'song-bg-medium': '#152535',
        'song-bg-light': '#1f3040',
        'song-text-primary': '#f5f0e8',
        'song-text-secondary': '#c9c0b0',
        'song-text-muted': '#8a8070',
        'song-accent': '#c94043',
        'song-gold': '#d4a84b',
        'song-jade': '#4a7c59',
        'song-ink': '#1a1a1a'
      },
      fontFamily: {
        'song': ['Noto Serif SC', 'serif'],
        'decorative': ['Ma Shan Zheng', 'cursive']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'ink-spread': 'inkSpread 2s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        inkSpread: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}