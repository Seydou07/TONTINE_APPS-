import type { CSSProperties, ReactNode } from 'react';

/**
 * Coquille des pages publiques de cagnotte (/c/...).
 * Hors des groupes (app)/(auth) : aucune connexion requise, aucune
 * navigation de l'application. Police système pour alléger la page en 3G.
 */
const shellStyle: CSSProperties = {
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
};

export default function PublicAppealLayout({ children }: { children: ReactNode }) {
  return (
    <div style={shellStyle} className="min-h-screen bg-white text-[15px] leading-normal text-[#12261E]">
      {children}
    </div>
  );
}
