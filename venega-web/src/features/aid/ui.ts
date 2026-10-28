/**
 * Classes partagées de la page publique de cagnotte.
 * Palette : texte #12261E, secondaire #5B6B65, bordure #E5E7EB, fond #F4F5F7,
 * vert primary (#0B6E4F), vert foncé primary-dark (#074B36), ambre #FCB031.
 */

export const card = 'rounded-[20px] border border-[#E5E7EB] bg-white';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export const btnPrimary =
  `inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#095E44] active:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const btnSecondary =
  `inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-white px-5 text-[15px] font-semibold text-[#12261E] transition-colors hover:bg-[#F4F5F7] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const inputBase =
  'h-12 w-full rounded-[12px] border bg-white px-3.5 text-[16px] text-[#12261E] placeholder:text-[#8A9792] focus:outline-none focus:ring-2 focus:ring-primary/20';

export function inputBorder(hasError: boolean) {
  return hasError ? 'border-[#D14343] focus:border-[#D14343]' : 'border-[#E5E7EB] focus:border-primary';
}

export const label = 'mb-1.5 block text-[14px] font-semibold text-[#12261E]';
export const errorText = 'mt-1.5 text-[13px] text-[#D14343]';
export const sectionTitle = 'text-[17px] font-bold text-[#12261E] [font-family:inherit]';
