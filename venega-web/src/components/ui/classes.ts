/**
 * Classes Tailwind partagées par toutes les pages du site.
 * Mêmes valeurs que la page publique de cagnotte (src/features/aid/ui.ts) :
 * cartes blanches à bord fin, boutons 52 px, champs 48 px, aplats sans dégradé.
 */

export const card = 'rounded-[20px] border border-line bg-white';
export const cardPadding = 'p-4 sm:p-5';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const btnBase = `inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

/** Action principale, vert du logo. */
export const btnPrimary = `${btnBase} h-[52px] w-full rounded-[14px] bg-primary px-5 text-[15px] text-white hover:bg-[#095E44] active:bg-primary-dark`;

/** Action secondaire, carte blanche à bord fin. */
export const btnSecondary = `${btnBase} h-[52px] w-full rounded-[14px] border border-line bg-white px-5 text-[15px] text-ink hover:bg-fill`;

/** Action posée sur le bandeau vert foncé : ambre du logo, texte ink. */
export const btnAmber = `${btnBase} h-11 rounded-[12px] bg-amber px-4 text-[14px] text-ink hover:bg-[#F4A41C]`;
export const btnAmberLg = `${btnBase} h-[52px] rounded-[14px] bg-amber px-6 text-[15px] text-ink hover:bg-[#F4A41C]`;

/** Bouton à bord blanc sur le bandeau vert foncé. */
export const btnOnDark = `${btnBase} h-11 rounded-[12px] border border-white/30 px-4 text-[14px] text-white hover:bg-white/10`;
export const btnOnDarkLg = `${btnBase} h-[52px] rounded-[14px] border border-white/30 px-6 text-[15px] text-white hover:bg-white/10`;

/** Petits boutons (dans une carte ou une ligne). */
export const btnSmallPrimary = `${btnBase} h-10 rounded-[12px] bg-primary px-4 text-[14px] text-white hover:bg-[#095E44]`;
export const btnSmallSecondary = `${btnBase} h-10 rounded-[12px] border border-line bg-white px-4 text-[14px] text-ink hover:bg-fill`;
export const btnSmallDanger = `${btnBase} h-10 rounded-[12px] border border-danger/30 bg-white px-4 text-[14px] text-danger hover:bg-danger-tint`;

/** Lien texte vert. */
export const linkText = 'font-semibold text-primary hover:text-primary-dark hover:underline underline-offset-2';

export const inputBase =
  'h-12 w-full rounded-[12px] border bg-white px-3.5 text-[16px] text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20';

export function inputBorder(hasError = false) {
  return hasError ? 'border-danger focus:border-danger' : 'border-line focus:border-primary';
}

export const input = `${inputBase} ${inputBorder(false)}`;
export const textarea = `${inputBase} ${inputBorder(false)} h-auto resize-none py-3`;
export const select = `${inputBase} ${inputBorder(false)} appearance-none pr-9`;

export const label = 'mb-1.5 block text-[14px] font-semibold text-ink';
export const helpText = 'mt-1.5 text-[13px] text-muted';
export const errorText = 'mt-1.5 text-[13px] text-danger';

export const sectionTitle = 'text-[17px] font-bold text-ink';
export const sectionSubtitle = 'mt-0.5 text-[14px] text-muted';

/** Carte de choix (radio visuel). */
export function choiceCard(active: boolean) {
  return `w-full rounded-[14px] border p-4 text-left transition-colors ${focusRing} ${
    active ? 'border-primary bg-[#F0F7F4]' : 'border-line bg-white hover:bg-fill'
  }`;
}

/** Puce de sélection (montant, fréquence, nombre…). */
export function chip(active: boolean) {
  return `h-12 rounded-[12px] border text-[15px] font-semibold transition-colors ${focusRing} ${
    active ? 'border-primary bg-[#F0F7F4] text-primary-dark' : 'border-line bg-white text-ink hover:bg-fill'
  }`;
}
