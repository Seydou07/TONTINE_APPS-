/** Libellé d'un score de fiabilité (sur 100). */
export function scoreLabel(score: number): string {
  if (score >= 80) return 'Bon';
  if (score >= 50) return 'Moyen';
  return 'Critique';
}
