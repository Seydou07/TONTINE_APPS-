/** Formatage commun (fr-BF). */

const numberFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 125000 -> « 125 000 F CFA » */
export function formatXOF(amount: number): string {
  return `${numberFmt.format(amount)} F CFA`;
}

/** 1250000 -> « 1,3 M » (indicateurs compacts) */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`;
  if (amount >= 10_000) return `${Math.round(amount / 1000).toLocaleString('fr-FR')} k`;
  return numberFmt.format(amount);
}

export function formatNumber(n: number): string {
  return numberFmt.format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** « il y a 3 h », « il y a 2 j » */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMin = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return formatDate(iso);
}

/** « +22600000123 » -> « +226 00 00 01 23 » */
export function formatPhone(phone: string): string {
  const m = phone.replace(/\s/g, '').match(/^\+226(\d{2})(\d{2})(\d{2})(\d{2})$/);
  return m ? `+226 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
