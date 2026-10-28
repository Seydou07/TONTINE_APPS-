/**
 * Types et utilitaires de liste partagés (recherche + pagination).
 * Le format `Paginated<T>` est celui attendu des endpoints admin de l'API.
 */

export interface ListParams<F extends string = string> {
  /** Recherche plein texte (nom, téléphone, code…) */
  q?: string;
  /** Filtre de statut principal ; 'ALL' = pas de filtre */
  status?: F | 'ALL';
  /** Page 1-indexée */
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 10;

/** Normalise une chaîne pour une recherche insensible à la casse et aux accents. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesQuery(q: string | undefined, ...fields: (string | undefined)[]): boolean {
  if (!q) return true;
  const needle = normalize(q).replace(/\s/g, '');
  if (!needle) return true;
  return fields.some((f) => f && normalize(f).replace(/\s/g, '').includes(needle));
}

export function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const total = items.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), maxPage);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page: safePage, pageSize };
}
