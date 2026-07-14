/** @type {import('tailwindcss').Config} */
const venegaPreset = require('../../packages/design-tokens/tailwind-preset');

module.exports = {
  presets: [venegaPreset, require('nativewind/preset')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
