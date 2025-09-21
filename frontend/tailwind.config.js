/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // SDG color classes
    'bg-sdg-green', 'bg-sdg-blue', 'bg-sdg-orange', 'bg-sdg-yellow', 'bg-sdg-red',
    'text-sdg-green', 'text-sdg-blue', 'text-sdg-orange', 'text-sdg-yellow', 'text-sdg-red',
    'border-sdg-green', 'border-sdg-blue', 'border-sdg-orange', 'border-sdg-yellow', 'border-sdg-red',
    'hover:bg-sdg-green/90', 'hover:bg-sdg-blue/90', 'hover:bg-sdg-orange/90',
    'from-sdg-green', 'from-sdg-blue', 'from-sdg-orange',
    'to-green-600', 'to-blue-600', 'to-orange-600',
    // Status colors
    'bg-success', 'bg-warning', 'bg-error', 'bg-info',
    'text-success', 'text-warning', 'text-error', 'text-info',
    'border-success', 'border-warning', 'border-error', 'border-info',
    // Component variants
    'btn-primary', 'btn-secondary', 'btn-success', 'btn-warning', 'btn-error',
    'card-elevated', 'card-outlined', 'card-filled',
    // Common utility classes
    'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full',
    'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
    'border', 'border-2', 'border-4',
    'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8',
    'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8',
    'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-6', 'mx-8',
    'my-1', 'my-2', 'my-3', 'my-4', 'my-6', 'my-8',
    'w-full', 'h-full', 'min-h-screen',
    'flex', 'inline-flex', 'grid', 'block', 'inline-block',
    'items-center', 'justify-center', 'justify-between',
    'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'font-medium', 'font-semibold', 'font-bold',
    'transition-colors', 'transition-all', 'duration-200',
    'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom SDG colors
        'sdg-green': '#2E7D32',
        'sdg-blue': '#1976D2',
        'sdg-orange': '#FF9800',
        'sdg-yellow': '#FFC107',
        'sdg-red': '#D32F2F',

        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',

        // Brand colors
        'brand': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },

        // Neutral colors (enhanced)
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 1s infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
