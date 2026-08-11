/**
 * Image registry for Venega.
 *
 * Each sub-folder holds one type of image. Drop your files here with the
 * exact names below, then un-comment the `require` line to use the local
 * file instead of the remote fallback. Nothing breaks while a file is
 * missing: the app falls back to a seed image.
 *
 * Folders & expected filenames:
 *   logo/        → mark.png, wordmark.png, splash.png   (official logo)
 *   landing/     → background.png, hero.png             ("Rejoignez-nous")
 *   onboarding/  → slide-1.png, slide-2.png, slide-3.png
 *   dashboard/   → promo-1.png, promo-2.png, promo-3.png
 *   auth/        → login.png, register.png
 *   kyc/         → intro.png, upload.png, success.png
 *   circles/     → default.png
 *   avatars/     → default.png
 *
 * Example to activate a local file once it exists:
 *   import { images } from './assets/images';
 *   source: images.landing.background   (require is uncommented below)
 */

export const paths = {
  logo: { mark: './logo/mark.png', wordmark: './logo/wordmark.png', splash: './logo/splash.png' },
  landing: { background: './landing/background.png', hero: './landing/hero.png' },
  onboarding: { slide1: './onboarding/slide-1.png', slide2: './onboarding/slide-2.png', slide3: './onboarding/slide-3.png' },
  dashboard: { promo1: './dashboard/promo-1.png', promo2: './dashboard/promo-2.png', promo3: './dashboard/promo-3.png' },
  auth: { login: './auth/login.png', register: './auth/register.png' },
  kyc: { intro: './kyc/intro.png', upload: './kyc/upload.png', success: './kyc/success.png' },
  circles: { default: './circles/default.png' },
  avatars: { default: './avatars/default.png' },
} as const;

/** Remote fallbacks used while a local file has not been added yet. */
export const fallback = {
  landing: 'https://picsum.photos/seed/venega-landing/800/640',
  onboarding1: 'https://picsum.photos/seed/venega-pay/640/480',
  onboarding2: 'https://picsum.photos/seed/venega-trust/640/480',
  onboarding3: 'https://picsum.photos/seed/venega-solidarity/640/480',
  circle: (seed: string) => `https://picsum.photos/seed/${seed}/800/320`,
} as const;
