'use client';

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PAGE_SIZE, type ListParams } from './list';

/**
 * État d'une liste : recherche (avec anti-rebond), filtre de statut, page.
 * Toute modification de la recherche ou du filtre ramène à la page 1.
 */
export function useListState<F extends string>(
  initialStatus: F | 'ALL' = 'ALL',
  pageSize = DEFAULT_PAGE_SIZE,
  initialSearch = '',
) {
  const [search, setSearch] = useState(initialSearch);
  const [q, setQ] = useState(initialSearch.trim());
  const [status, setStatusRaw] = useState<F | 'ALL'>(initialStatus);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  // Navigation vers la même page avec d'autres paramètres d'URL (recherche Ctrl+K, lien
  // « Ouvrir dans la file KYC », menu latéral) : le composant n'est pas remonté, on
  // réapplique donc le filtre et la recherche venus de l'URL.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setStatusRaw(initialStatus);
    setSearch(initialSearch);
    setQ(initialSearch.trim());
    setPage(1);
  }, [initialStatus, initialSearch]);

  const setStatus = (s: F | 'ALL') => {
    setStatusRaw(s);
    setPage(1);
  };

  const params: ListParams<F> = { q, status, page, pageSize };
  return { search, setSearch, status, setStatus, page, setPage, params };
}
