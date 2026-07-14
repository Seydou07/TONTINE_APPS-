/** @type {import('tailwindcss').Config} */
const venegaPreset = require('@venega/design-tokens/tailwind-preset');

module.exports = {
  presets: [venegaPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
