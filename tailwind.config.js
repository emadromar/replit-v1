/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'nav': '40',
        'dropdown': '50',
        'overlay': '60',
        'drawer': '70',
        'modal': '80',
        'toast': '100',
      },
      fontSize: {
        'page': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'section': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'sub': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      spacing: {
        '1': '4px', '2': '8px', '3': '12px', '4': '16px', '5': '20px', '6': '24px', '8': '32px', '10': '40px', '12': '48px', '16': '64px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fbfaff', 100: '#f4effd', 200: '#e9dffc', 300: '#d8c5fa', 400: '#c09ff8', 500: '#a576f6', 600: '#9053f4',
          700: '#6D28D9', 800: '#5f22bc', 900: '#4c1a92',
        },
        subscription: {
          free: '#64748b', basic: '#3b82f6', pro: '#6D28D9',
        },
        alert: {
          success: '#16a34a', warning: '#f97316', error: '#dc2626',
        },
        ai: {
          light: '#f4effd', DEFAULT: '#6D28D9', dark: '#4c1a92',
        }
      },
      // FIX: Standardized Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Widgets / Cards
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Modals
        'primary': '0 4px 14px 0 rgba(109, 40, 217, 0.3)', // Primary Buttons
      }
    },
  },
  plugins: [],
}