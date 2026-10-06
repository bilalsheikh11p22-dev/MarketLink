/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#122A20',
          light: '#1E3F30',
          deep: '#0B1D15'
        },
        sage: {
          DEFAULT: '#4F8A5B',
          light: '#7CB88A'
        },
        cream: {
          DEFAULT: '#F6F1E7',
          soft: '#FBF8F1'
        },
        earth: {
          DEFAULT: '#6B4F3B',
          light: '#9C7A56'
        },
        olive: {
          DEFAULT: '#C4A35A',
          light: '#D4BC7E'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif']
      },
      letterSpacing: {
        widest2: '0.28em'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
