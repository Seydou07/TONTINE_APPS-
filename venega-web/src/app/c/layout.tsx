import type { ReactNode } from 'react';

/**
 * Coquille des pages publiques de cagnotte (/c/...) : hors des groupes (app)/(auth),
 * aucune connexion requise, aucune navigation de l'application.
 */
export default function PublicAppealLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-ink">{children}</div>;
}
