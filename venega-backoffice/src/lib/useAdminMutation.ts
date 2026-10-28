'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

/**
 * Mutation admin standard :
 *  - invalide les listes concernées + compteurs, tableau de bord et journal ;
 *  - affiche un message « modifié localement » (tant que l'API n'est pas branchée) ;
 *  - affiche l'erreur sinon.
 * Quand l'API sera branchée, remplacer `toast.local` par `toast.notify('success', …)`.
 */
export function useAdminMutation<TVars, TResult>({
  mutationFn,
  invalidate,
  successTitle,
  onSuccess,
}: {
  mutationFn: (vars: TVars) => Promise<TResult>;
  invalidate: string[];
  successTitle: (result: TResult, vars: TVars) => string;
  onSuccess?: (result: TResult, vars: TVars) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onSuccess: (result, vars) => {
      for (const key of [...invalidate, 'nav-counts', 'dashboard', 'audit']) {
        void qc.invalidateQueries({ queryKey: [key] });
      }
      toast.local(successTitle(result, vars));
      onSuccess?.(result, vars);
    },
    onError: (e) => toast.error(e),
  });
}
