import { Redirect, useLocalSearchParams } from 'expo-router';
import { CircleType } from '@venega/types';
import { getCircle } from '../../../src/features/circles/circleStore';

/*
 * Lien générique vers un cercle : une tontine (en argent ou en nature) s'ouvre
 * sur l'écran Tontine, une caisse sur l'écran Solidarité, une cagnotte sur sa page.
 * Les anciens liens `/circle/<id>` continuent ainsi de fonctionner.
 */
export default function CircleIndexRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circle = id ? getCircle(id) : undefined;

  if (!circle) return <Redirect href="/(tabs)/circles" />;
  if (circle.type === CircleType.AID_APPEAL) return <Redirect href={`/aid/${circle.id}` as any} />;
  if (circle.type === CircleType.SOLIDARITY_ONLY) {
    return <Redirect href={`/circle/${circle.id}/solidarity` as any} />;
  }
  return <Redirect href={`/circle/${circle.id}/tontine` as any} />;
}
