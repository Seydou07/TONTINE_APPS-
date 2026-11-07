import Image from 'next/image';

/*
 * Logos d'opérateurs (fichiers d'origine de /public/operators), recadrés en
 * CSS : les fichiers ont des marges et des formats différents.
 */

export type OperatorKey = 'orange' | 'moov' | 'wave';

export const OPERATOR_LIST: { key: OperatorKey; label: string }[] = [
  { key: 'orange', label: 'Orange Money' },
  { key: 'moov', label: 'Moov Money' },
  { key: 'wave', label: 'Wave' },
];

const SRC: Record<OperatorKey, { src: string; ratio: number; zoom: number }> = {
  orange: { src: '/operators/pay-orange.png', ratio: 1, zoom: 1 },
  moov: { src: '/operators/pay-moov.png', ratio: 1.6, zoom: 1.12 },
  wave: { src: '/operators/pay-wave.png', ratio: 1, zoom: 1.42 },
};

export function OperatorBadge({ op, size = 36, alt, className = '' }: { op: OperatorKey; size?: number; alt?: string; className?: string }) {
  const { src, ratio, zoom } = SRC[op];
  const w = Math.round(size * ratio);
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden bg-white ${className}`}
      style={{ width: w, height: size, borderRadius: Math.round(size * 0.26) }}
    >
      <Image
        src={src}
        alt={alt ?? ''}
        fill
        sizes={`${w * 2}px`}
        className="object-cover"
        style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined }}
      />
    </span>
  );
}
