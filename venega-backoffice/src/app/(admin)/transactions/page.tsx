import { redirect } from 'next/navigation';

/**
 * Écran retiré lors de la refonte du backoffice (hors périmètre : KYC, cagnottes,
 * alertes, utilisateurs, cercles). Redirige vers le tableau de bord.
 */
export default function RemovedPage() {
  redirect('/');
}
