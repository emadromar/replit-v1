/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. HIERARCHY: Strict Z-Index Scale
      zIndex: {
        'nav': '40',        // Sticky headers
        'dropdown': '50',   // Select menus
        'overlay': '60',    // Backdrops
        'drawer': '70',     // Slide-overs
        'modal': '80',      // Centered modals
        'toast': '100',     // Notifications (Always on top)
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
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fbfaff',
          100: '#f4effd',
          200: '#e9dffc',
          300: '#d8c5fa',
          400: '#c09ff8',
          500: '#a576f6',
          600: '#9053f4', 
          700: '#6D28D9', // Main Brand
          800: '#5f22bc',
          900: '#4c1a92',
        },
        subscription: {
          free: '#64748b',
          basic: '#3b82f6',
          pro: '#6D28D9',
        },
        alert: {
          success: '#16a34a',
          warning: '#f97316',
          error: '#dc2626',
        },
        ai: {
          light: '#f4effd', 
          DEFAULT: '#6D28D9', 
          dark: '#4c1a92',  
        }
      },
      // 2. DEPTH: Subtle, expensive-looking shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Softer than before
        'md': '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        // Colored shadows for primary actions
        'primary': '0 4px 14px 0 rgba(109, 40, 217, 0.3)', 
      }
    },
  },
  plugins: [],
}