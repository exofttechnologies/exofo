/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1261E8',
          deep: '#0645B5',
          dark: '#032a75',
          light: '#DCEBFF',
          ice: '#F5F8FF',
          surface: '#F8FAFF',
        },
        text: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(18, 97, 232, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'glass-card': '0 10px 25px -5px rgba(18, 97, 232, 0.06), 0 8px 10px -6px rgba(18, 97, 232, 0.04)',
        'blue-glow': '0 14px 35px -6px rgba(18, 97, 232, 0.45), 0 6px 16px -4px rgba(6, 69, 181, 0.35)',
        'nav-bar': '0 20px 40px -10px rgba(15, 23, 42, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
};

