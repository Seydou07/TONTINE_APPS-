import { CircleAlert } from 'lucide-react';

/**
 * Erreur qui concerne tout le formulaire (identifiants refusés, réseau coupé,
 * serveur indisponible). Les erreurs propres à un champ s'affichent sous ce champ.
 */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-[12px] bg-danger-tint p-3">
      <CircleAlert size={18} className="mt-px shrink-0 text-danger" aria-hidden />
      <p className="flex-1 text-[13px] text-danger">{message}</p>
    </div>
  );
}
