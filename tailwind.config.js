import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Professional brand colors
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE', 
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        
        // Sophisticated grays
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5', 
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        
        // Music industry inspired accent colors
        accent: {
          cyan: '#06B6D4',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#EC4899',
          orange: '#F97316',
        },
        
        // Status colors
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        
        // Surface colors for dark theme
        surface: {
          primary: '#000000',
          secondary: '#0A0A0A',
          tertiary: '#171717',
          elevated: '#262626',
        },
        
        // Brutalist colors
        brutalist: {
          black: '#000000',
          dark: '#0e0e0e',
          white: '#ffffff',
          gray: '#333333',
        },
        
        // Legacy support (will be phased out)
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        ebony: '#000000',
        panel: '#171717',
        border: '#262626',
        muted: '#737373',
        neutral: {
          dark: '#171717',
          light: '#F5F5F5',
        },
      },
      
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', 'Fira Code', ...fontFamily.mono],
        display: ['Space Grotesk', 'Arial Black', ...fontFamily.sans],
        heading: ['Space Grotesk', 'Arial Black', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
        brutalist: ['Space Grotesk', 'Arial Black', ...fontFamily.sans],
        'brutalist-mono': ['JetBrains Mono', 'Courier New', ...fontFamily.mono],
      },
      
      fontSize: {
        // Enhanced mobile-first typography
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1.1' }],
        '9xl': ['8rem', { lineHeight: '1.1' }],
        
        // Semantic heading sizes with better mobile scaling
        'heading-sm': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'heading-base': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'heading-xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'heading-2xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800' }],
        'heading-3xl': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        
        // Body text variations
        'body-sm': ['0.875rem', { lineHeight: '1.5rem' }],
        'body-base': ['1rem', { lineHeight: '1.625rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        
        // UI element text
        'ui-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'ui-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'ui-base': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
      },
      
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        
        // Professional card shadows
        card: '0 2px 12px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px 0 rgba(0,0,0,0.12)',
        navbar: '0 2px 8px 0 rgba(0,0,0,0.10)',
        
        // Glow effects for interactive elements
        'glow-brand': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        
        // Brutalist shadows
        'brutal': '4px 4px 0 #333333',
        'brutal-lg': '6px 6px 0 #333333',
        'brutal-xl': '8px 8px 0 #333333',
      },
      
      borderRadius: {
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        88: '22rem',
        112: '28rem',
        128: '32rem',
        
        // Safe area spacing for mobile
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        
        // Mobile-optimized button and tap target sizes
        'tap-target': '2.75rem', // 44px minimum for accessibility
        'mobile-nav': '3.5rem',
        
        // Common mobile spacing patterns
        'mobile-padding': '1rem',
        'mobile-margin': '0.75rem',
      },
      
      // Mobile-first responsive design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        
        // Mobile-specific breakpoints
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
        
        // Touch device queries
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          to: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
