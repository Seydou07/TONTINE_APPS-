import { LocalAppealFallback } from '@/features/aid/components/LocalAppealFallback';

/** Code inconnu côté serveur : on cherche encore dans les données de démo du navigateur. */
export default function AppealNotFound() {
  return <LocalAppealFallback />;
}
