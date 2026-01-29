/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00C73C',
        secondary: '#FF6B6B',
        dark: '#1a1a1a',
      },
      animation: {
        'rainbow': 'rainbow 3s linear infinite',
      },
      keyframes: {
        rainbow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)' 
          },
          '16%': { 
            boxShadow: '0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4)' 
          },
          '33%': { 
            boxShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.4)' 
          },
          '66%': { 
            boxShadow: '0 0 20px rgba(0, 0, 255, 0.8), 0 0 40px rgba(0, 0, 255, 0.4)' 
          },
          '83%': { 
            boxShadow: '0 0 20px rgba(139, 0, 255, 0.8), 0 0 40px rgba(139, 0, 255, 0.4)' 
          },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
