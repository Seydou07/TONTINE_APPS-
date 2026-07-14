/**
 * VENEGA — Tailwind CSS Preset
 * Mappe les design tokens vers la configuration Tailwind.
 * Utilisé par apps/web et apps/backoffice.
 * Toujours importer ce preset dans tailwind.config.ts au lieu de coder des couleurs en dur.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
          tint: 'var(--color-primary-tint)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
          tint: 'var(--color-accent-tint)',
        },
        purple: {
          DEFAULT: 'var(--color-purple)',
          tint: 'var(--color-purple-tint)',
        },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'text-main': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        danger: {
          DEFAULT: 'var(--color-danger)',
          tint: 'var(--color-danger-tint)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          tint: 'var(--color-warning-tint)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          tint: 'var(--color-info-tint)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
    },
  },
};
