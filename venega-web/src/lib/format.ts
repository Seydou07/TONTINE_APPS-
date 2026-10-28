const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 10000 -> "10 000" */
export function formatNumber(value: number): string {
  // Intl utilise une espace fine insécable : on la garde, elle évite les retours à la ligne.
  return numberFormat.format(value);
}

/** 10000 -> "10 000 F CFA" */
export function formatFcfa(value: number): string {
  return `${formatNumber(value)} F CFA`;
}

/** "2026-07-01T10:00:00Z" -> "1 juil. 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "2026-07-01T10:00:00Z" -> "1 juil. 2026, 10:00" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "+22670123456" -> "+226 70 12 34 56" */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('226') && digits.length === 11) {
    return `+226 ${digits.slice(3).replace(/(\d{2})(?=\d)/g, '$1 ')}`;
  }
  return raw;
}

/** "Aminata Ouédraogo" -> "AO" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.charAt(0) ?? '') + (parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '')).toUpperCase();
}
