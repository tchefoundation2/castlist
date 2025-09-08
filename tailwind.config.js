/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7828C8',
          50: '#FBF5FF',
          100: '#F4E6FF',
          200: '#E9D0FF',
          300: '#D9B0FF',
          400: '#C384FF',
          500: '#A958EB',
          600: '#9034D3',
          700: '#7828C8',
          800: '#6020A0',
          900: '#4F1B82',
          950: '#2E0F50'
        }
      },
      borderRadius: {
          'xl': '0.75rem', // 12px
          '2xl': '1rem',    // 16px
          '3xl': '1.5rem',  // 24px
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        animatedGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        gradient: 'animatedGradient 15s ease infinite',
      },
      backgroundSize: {
          '300%': '300% 300%',
      }
    },
  },
  plugins: [],
}
