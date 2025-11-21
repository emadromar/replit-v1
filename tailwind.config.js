/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. TYPOGRAPHY SYSTEM: Clear hierarchy for a "simple" UI
      fontSize: {
        'page': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],      // 32px - Page Titles
        'section': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],    // 24px - Section Headers
        'sub': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 18px - Sub-headers
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],       // 16px - Standard text
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],   // 14px - Small text
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],       // 12px - Labels/Badges
      },
      // 2. SPACING SYSTEM: Consistent 4px grid for clean whitespace
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
        // Refined Royal Purple Palette
        primary: {
          50: '#fbfaff',
          100: '#f4effd',
          200: '#e9dffc',
          300: '#d8c5fa',
          400: '#c09ff8',
          500: '#a576f6',
          600: '#9053f4', 
          700: '#6D28D9', // Main Brand Color
          800: '#5f22bc',
          900: '#4c1a92',
        },
        // Plan-specific branding
        subscription: {
          free: '#64748b',  // Slate
          basic: '#3b82f6', // Blue
          pro: '#6D28D9',   // Purple
        },
        // Semantic colors for UI feedback
        alert: {
          success: '#16a34a', // Green
          warning: '#f97316', // Orange
          error: '#dc2626',   // Red
        },
        // AI features special branding
        ai: {
          light: '#f4effd', 
          DEFAULT: '#6D28D9', 
          dark: '#4c1a92',  
        }
      },
      // 3. MODERN SHADOWS: Softer and more subtle
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 12px 0 rgba(0, 0, 0, 0.05)', // Soft card shadow
        'md': '0 6px 16px 0 rgba(0, 0, 0, 0.08)',      // Hover state
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}