/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#13ec5b',
        'primary-focus': '#0ebf49',
        'primary-content': '#003811',
        secondary: '#3e4c42',
        'background-light': '#f6f8f6',
        'background-dark': '#030712',
        'surface-light': '#ffffff',
        'surface-dark': '#141c16',
        'text-light': '#333333',
        'text-dark': '#ffffff',
        'text-secondary-light': '#475569',
        'text-secondary-dark': '#cbd5e1',
        'icon-bg-light': '#e8f5f3',
        'icon-bg-dark': '#283933',
        // Modern accent colors
        accent: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899',
          amber: '#f59e0b',
        },
        // Status colors
        success: {
          light: '#10b981',
          dark: '#34d399',
        },
        warning: {
          light: '#f59e0b',
          dark: '#fbbf24',
        },
        error: {
          light: '#ef4444',
          dark: '#f87171',
        },
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(19, 236, 91, 0.4)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
