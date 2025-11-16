/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Set 'Inter' as the default sans-serif font
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // NEW: Royal Purple brand color
        primary: {
          50: '#fbfaff',
          100: '#f4effd',
          200: '#e9dffc',
          300: '#d8c5fa',
          400: '#c09ff8',
          500: '#a576f6',
          600: '#9053f4', // A slightly brighter variant
          700: '#6D28D9', // Your Main Brand Color
          800: '#5f22bc',
          900: '#4c1a92',
        },
        // NEW: Plan-specific colors
        subscription: {
          free: '#64748b',  // Slate-500
          basic: '#3b82f6', // Blue-500 (A good contrast to purple)
          pro: '#6D28D9',   // Pro matches the brand
        },
        // Accent colors for UI feedback
        alert: {
          success: '#16a34a', // Green-600
          warning: '#f97316', // Orange-500
          error: '#dc2626',   // Red-600
        },
        // AI features will use the brand color
        ai: {
          light: '#f4effd', // primary-100
          DEFAULT: '#6D28D9', // primary-700
          dark: '#4c1a92',  // primary-900
        }
      },
      // Soft shadows for the modern card design
      boxShadow: {
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}