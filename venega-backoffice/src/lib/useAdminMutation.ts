'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

/**
 * Mutation admin standard :
 *  - rafraîchit toutes les données affichées (une action touche souvent plusieurs fiches :
 *    rattacher un paiement modifie l'utilisateur, le cercle, la file de rapprochement, le journal…) ;
 *  - affiche un message « modifié localement » (tant que l'API n'est pas branchée) ;
 *  - affiche l'erreur sinon.
 * Quand l'API sera branchée, remplacer `toast.local` par `toast.notify('success', …)`.
 */
export function useAdminMutation<TVars, TResult>({
  mutationFn,
  successTitle,
  onSuccess,
}: {
  mutationFn: (vars: TVars) => Promise<TResult>;
  /** Conservé pour la lisibilité : clés principales concernées (tout est rafraîchi). */
  invalidate?: string[];
  successTitle: (result: TResult, vars: TVars) => string;
  onSuccess?: (result: TResult, vars: TVars) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onSuccess: (result, vars) => {
      void qc.invalidateQueries();
      toast.local(successTitle(result, vars));
      onSuccess?.(result, vars);
    },
    onError: (e) => toast.error(e),
  });
}
