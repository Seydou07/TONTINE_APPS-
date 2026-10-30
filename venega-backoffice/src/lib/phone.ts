/**
 * Numéros de téléphone burkinabè (+226 + 8 chiffres).
 * Utilisé par la recherche globale : l'agent tape le numéro tel que l'appelant le dicte
 * (« 70 12 34 56 », « 0022670123456 », « +226 70… »).
 */

/** Garde uniquement les chiffres et retire l'indicatif 226 / 00226 s'il précède 8 chiffres. */
export function phoneDigits(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('00226') && d.length > 8) d = d.slice(5);
  else if (d.startsWith('226') && d.length > 8) d = d.slice(3);
  return d;
}

/** Vrai si la saisie ressemble à un numéro (au moins 4 chiffres, rien d'autre que chiffres, espaces, +, ., -). */
export function looksLikePhone(input: string): boolean {
  return /^[\d\s+().-]+$/.test(input.trim()) && input.replace(/\D/g, '').length >= 4;
}

/** Compare une saisie partielle à un numéro stocké au format +226XXXXXXXX. */
export function phoneMatches(query: string, stored: string): boolean {
  const q = phoneDigits(query);
  if (q.length < 4) return false;
  return phoneDigits(stored).includes(q);
}

/** Format E.164 attendu par l'API : +226XXXXXXXX, ou null si le numéro est invalide. */
export function toE164BF(input: string): string | null {
  const d = phoneDigits(input);
  return /^\d{8}$/.test(d) ? `+226${d}` : null;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

/** Lien WhatsApp (wa.me attend le numéro sans « + »). */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}
