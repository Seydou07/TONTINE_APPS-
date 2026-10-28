/**
 * VENEGA — Design Tokens pour React Native
 * Export TypeScript des valeurs brutes pour NativeWind et les composants natifs.
 * Source de vérité côté mobile — doit rester synchronisé avec tokens.css.
 *
 * Typographie : police système (Roboto sur Android, SF Pro sur iOS), comme
 * les applications grand public. Aucune police à télécharger : démarrage plus
 * rapide et application plus légère sur les réseaux lents.
 */

export const colors = {
  primary: {
    DEFAULT: '#0B6E4F',
    dark: '#074B36',
    light: '#0F8563',
    tint: '#E4F0EB',
    soft: '#C9E3D8',
  },
  accent: {
    // Ambre du logo Venega (#FCB031).
    DEFAULT: '#FCB031',
    // Assez foncé pour du texte sur blanc (« En attente »…).
    dark: '#A86200',
    deep: '#8A5A12',
    tint: '#FEF3DC',
  },
  purple: {
    DEFAULT: '#7A4E9C',
    tint: '#EFE6F4',
  },

  /** Neutres — texte, traits et fonds. Les textes tirent vers le vert du logo (pas de noir pur). */
  ink: '#12261E',
  inkSoft: '#384A43',
  muted: '#5B6B65',
  subtle: '#8F96A0',
  line: '#E5E7EB',
  lineStrong: '#CFD4DA',
  fill: '#F4F5F7',

  bg: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#16181D',
  textMuted: '#5E6470',
  border: '#E5E7EB',
  button: {
    start: '#0C7A57',
    end: '#074B36',
  },
  success: '#0B6E4F',
  danger: {
    DEFAULT: '#C1443A',
    dark: '#9E352D',
    tint: '#F7E7E5',
  },
  warning: {
    DEFAULT: '#FCB031',
    tint: '#FEF3DC',
  },
  info: {
    DEFAULT: '#2B7FB0',
    tint: '#E3F0F8',
  },
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
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
    shadowColor: '#16181D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#16181D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#16181D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

/** Graisses de la police système. */
export const fonts = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Échelle typographique — alignée sur les applications grand public
 * (corps de texte 15, titres d'écran 22, jamais au-delà de 28).
 */
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

/** Dimensions des composants interactifs (cibles tactiles ≥ 48 px). */
export const sizes = {
  button: 52,
  buttonSmall: 40,
  input: 52,
  listItem: 64,
  icon: 20,
  iconButton: 40,
} as const;
