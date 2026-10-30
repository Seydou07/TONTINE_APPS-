import { initials } from '@/lib/format';

interface AvatarProps {
  /** Nom complet : sert aux initiales quand il n'y a pas de photo. */
  name: string;
  uri?: string | null;
  size?: number;
  /** Anneau ambre (bénéficiaire du tour, personne mise en avant). */
  highlighted?: boolean;
  className?: string;
}

/**
 * Avatar unique du site (comme l'app mobile) : photo si disponible, sinon
 * initiales vert foncé sur vert clair.
 */
export function Avatar({ name, uri, size = 40, highlighted = false, className = '' }: AvatarProps) {
  const ring = highlighted ? 'ring-2 ring-amber' : '';
  const box = { width: size, height: size };
  if (uri) {
    return (
      // Photo locale (data URL) ou distante : <img> simple.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={uri}
        alt=""
        width={size}
        height={size}
        style={box}
        className={`shrink-0 rounded-full bg-fill object-cover ${ring} ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-dark ${ring} ${className}`}
      style={{ ...box, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {initials(name) || '?'}
    </span>
  );
}
