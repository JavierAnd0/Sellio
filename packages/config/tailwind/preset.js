/**
 * Tailwind preset compartido para Sellio.
 * Extiende esto en los tailwind.config de cada app:
 *
 *   presets: [require('@sellio/config/tailwind/preset')]
 *
 * Tokens basados en los mockups de Auth Flow y Landing.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // ── Brand ─────────────────────────────────────────
        coral: {
          DEFAULT: '#E8341A',
          dim: '#C42A12',
          50: '#FEF2F0',
          100: '#FEE0DB',
          200: '#FCC5BC',
          300: '#F99B8C',
          400: '#F47060',
          500: '#E8341A',
          600: '#C42A12',
          700: '#9E210E',
          800: '#761809',
          900: '#4C0F04',
        },

        // ── Theme tokens (consumen CSS variables) ─────────
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',

        // ── Semánticos ────────────────────────────────────
        error: '#FF4444',
        success: '#52D699',
        warning: '#E8B96A',
        info: '#4FC3F7',
      },

      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
      },

      animation: {
        'fade-slide-up': 'fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-slide-in': 'fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) both',
        spin: 'spin 0.7s linear infinite',
      },

      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-32px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
