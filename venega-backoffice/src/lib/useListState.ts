'use client';

import { useEffect, useState } from 'react';
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

  const setStatus = (s: F | 'ALL') => {
    setStatusRaw(s);
    setPage(1);
  };

  const params: ListParams<F> = { q, status, page, pageSize };
  return { search, setSearch, status, setStatus, page, setPage, params };
}
