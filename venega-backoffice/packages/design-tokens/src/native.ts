/**
 * VENEGA — Design Tokens pour React Native
 * Export TypeScript des valeurs brutes pour NativeWind et les composants natifs.
 * Source de vérité côté mobile — doit rester synchronisé avec tokens.css.
 */

export const colors = {
  primary: {
    DEFAULT: '#0B6E4F',
    dark: '#074B36',
    light: '#0F8563',
    tint: '#E4F0EB',
  },
  accent: {
    DEFAULT: '#D9A441',
    dark: '#B9852A',
    tint: '#FBF1DD',
  },
  purple: {
    DEFAULT: '#7A4E9C',
    tint: '#EFE6F4',
  },
  bg: '#FAF7F1',
  surface: '#FFFFFF',
  text: '#22271F',
  textMuted: '#6E7568',
  border: '#D8D2C2',
  success: '#0B6E4F',
  danger: {
    DEFAULT: '#C1443A',
    tint: '#F7E7E5',
  },
  warning: {
    DEFAULT: '#D9A441',
    tint: '#FBF1DD',
  },
  info: {
    DEFAULT: '#2B7FB0',
    tint: '#E3F0F8',
  },
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0B6E4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B6E4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0B6E4F',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

export const fonts = {
  heading: 'Sora',
  body: 'WorkSans',
} as const;
