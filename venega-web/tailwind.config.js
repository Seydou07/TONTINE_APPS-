/** @type {import('tailwindcss').Config} */
const venegaPreset = require('./packages/design-tokens/tailwind-preset');

const systemFont = [
  'system-ui',
  '-apple-system',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Noto Sans"',
  'sans-serif',
];

module.exports = {
  presets: [venegaPreset],
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Neutres de l'app mobile (textes teintés de vert, pas de noir pur).
      colors: {
        // Valeurs hexadécimales (et non var(--…)) pour que les modificateurs
        // d'opacité Tailwind (`bg-primary/10`, `ring-primary/20`) fonctionnent.
        primary: {
          DEFAULT: '#0B6E4F',
          dark: '#074B36',
          light: '#0F8563',
          tint: '#E4F0EB',
        },
        accent: {
          DEFAULT: '#FCB031',
          dark: '#A86200',
          tint: '#FEF3DC',
        },
        danger: {
          DEFAULT: '#C1443A',
          tint: '#F7E7E5',
        },
        ink: '#12261E',
        'ink-soft': '#384A43',
        muted: '#5B6B65',
        subtle: '#8F96A0',
        line: '#E5E7EB',
        'line-strong': '#CFD4DA',
        fill: '#F4F5F7',
        amber: {
          DEFAULT: '#FCB031',
          dark: '#A86200',
          tint: '#FEF3DC',
        },
      },
      fontFamily: {
        sans: systemFont,
        heading: systemFont,
        body: systemFont,
      },
    },
  },
  plugins: [],
};
