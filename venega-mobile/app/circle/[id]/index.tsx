import { Redirect, useLocalSearchParams } from 'expo-router';
import { CircleType } from '@venega/types';
import CircleDetailScreen from '../../../src/features/circles/screens/CircleDetailScreen';
import { getCircle } from '../../../src/features/circles/circleStore';

/*
 * Ancienne fiche de cercle. Une tontine (en argent ou en nature) s'ouvre
 * désormais sur l'écran Tontine et une caisse sur l'écran Solidarité :
 * on redirige pour que les anciens liens continuent de fonctionner.
 */
export default function CircleIndexRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circle = id ? getCircle(id) : undefined;

  if (circle && (circle.type === CircleType.TONTINE_ONLY || circle.type === CircleType.NATURE)) {
    return <Redirect href={`/circle/${circle.id}/tontine` as any} />;
  }
  if (circle && circle.type === CircleType.SOLIDARITY_ONLY) {
    return <Redirect href={`/circle/${circle.id}/solidarity` as any} />;
  }
  return <CircleDetailScreen />;
}
