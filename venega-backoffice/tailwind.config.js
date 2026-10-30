/**
 * Venega Backoffice — Tailwind
 * Palette strictement issue du logo (vert + ambre) et textes « ink » teintés vert.
 * Le rouge est réservé aux états de danger / refus.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B6E4F',
          hover: '#095E44',
          dark: '#074B36',
          tint: '#E7F1EC',
          line: '#BFD9CD',
        },
        accent: {
          DEFAULT: '#FCB031',
          ink: '#A86200',
          tint: '#FEF3DC',
          line: '#F5D9A3',
        },
        ink: {
          DEFAULT: '#12261E',
          soft: '#384A43',
          muted: '#5B6B65',
        },
        canvas: '#F3F5F4',
        line: '#DDE3E0',
        danger: {
          DEFAULT: '#C1443A',
          hover: '#A5382F',
          tint: '#FDEDEB',
          line: '#F3C3BD',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '20px'],
        lg: ['16px', '22px'],
        xl: ['18px', '24px'],
        '2xl': ['22px', '28px'],
      },
    },
  },
  plugins: [],
};
